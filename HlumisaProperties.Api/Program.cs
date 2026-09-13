using System.Text;
using System.Linq;
using Hangfire;
using Hangfire.InMemory;
using HlumisaProperties.Api;
using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Application.Dtos;
using HlumisaProperties.Infrastructure.Services;
using HlumisaProperties.Domain;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// JWT SETTINGS
// ======================================================
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtSettings>(jwtSection);
var jwtSettings = jwtSection.Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt settings are not configured.");

// Fail fast with a clear error instead of a cryptic IDX10703 (zero-length
// SymmetricSecurityKey) on the first request when Jwt:Secret is empty,
// e.g. when JWT_SECRET is missing from the deployment environment.
if (string.IsNullOrWhiteSpace(jwtSettings.Secret) || jwtSettings.Secret.Length < 16)
{
    throw new InvalidOperationException(
        "Jwt:Secret is missing or too short (minimum 16 characters). " +
        "Set the JWT_SECRET environment variable (e.g. in the deployment .env file).");
}

// Issuer/Audience must be set: tokens are issued with them and validated against
// them. Empty values produce tokens without iss/aud claims that fail validation
// with "The audience 'empty' is invalid" on every authorized request.
if (string.IsNullOrWhiteSpace(jwtSettings.Issuer) || string.IsNullOrWhiteSpace(jwtSettings.Audience))
{
    throw new InvalidOperationException(
        "Jwt:Issuer and Jwt:Audience must be configured. " +
        "Set the JWT_ISSUER and JWT_AUDIENCE environment variables (e.g. in the deployment .env file).");
}

// ======================================================
// BOOKS CSV SETTINGS (books.csv file stored on the API — no database)
// ======================================================
var booksCsvSection = builder.Configuration.GetSection("BooksCsv");
builder.Services.Configure<BooksCsvSettings>(booksCsvSection);
// BooksCsvService takes BooksCsvSettings directly (not IOptions), so also register the bound instance.
builder.Services.AddSingleton(booksCsvSection.Get<BooksCsvSettings>() ?? new BooksCsvSettings());

// ======================================================
// CONTROLLERS + OPEN API
// ======================================================
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    // Allow ALL origins, methods and headers.
    // NOTE: we reflect the request origin instead of returning "*" because the
    // UIs send credentials (Authorization header / cookies) - browsers reject
    // the literal "*" wildcard when credentials are involved.
    options.AddPolicy("LandingPage", policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());

    options.AddPolicy("Api", policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ======================================================
// AUTHENTICATION (JWT BEARER)
// ======================================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings.Secret))
    };
});

// ======================================================
// YOUR APPLICATION SERVICES
// ======================================================
// Database (MySQL via Pomelo)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    try
    {
        // Try to auto-detect the MySQL server version (requires a live connection)
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString),
            mySqlOptions => mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 10,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null));
    }
    catch
    {
        // If the DB is temporarily unreachable, fall back to a known version so the app can start.
        // The app will retry DB operations when the database comes back online.
        options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 37)),
            mySqlOptions => mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 10,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null));
    }
});

// ASP.NET Core Identity
builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

// HTTP clients + Services
builder.Services.AddHttpClient(); // default
builder.Services.AddHttpClient<IFacebookMessengerService, FacebookMessengerService>();
builder.Services.AddHttpClient<ILLMService, LLMService>();

// Messenger Service - Graph API (Primary)
builder.Services.AddScoped<IFacebookMessengerService, FacebookMessengerService>();
builder.Services.AddScoped<IWhatsAppService, WhatsAppService>();
builder.Services.AddScoped<ILLMService, LLMService>();
builder.Services.AddScoped<ILeadExtractionService, LeadExtractionService>();

// CRUD domain services
builder.Services.AddScoped<IPropertyListingService, PropertyListingService>();
builder.Services.AddScoped<IBooksCsvService, BooksCsvService>();
builder.Services.AddScoped<ITransactionLedgerService, TransactionLedgerService>();
builder.Services.AddScoped<IReferralService, ReferralService>();
builder.Services.AddScoped<IBuyerService, BuyerService>();
builder.Services.AddScoped<ISellerService, SellerService>();

// ======================================================
// HANGFIRE CONFIGURATION
// ======================================================
builder.Services.AddHangfire(config =>
{
    config.UseSimpleAssemblyNameTypeSerializer()
          .UseRecommendedSerializerSettings()
          .UseInMemoryStorage();
});

builder.Services.AddHangfireServer();

var app = builder.Build();

// ======================================================
// AUTO-APPLY DATABASE MIGRATIONS + SEED ADMIN ON STARTUP
// WITH SELF-HEALING BACKGROUND RETRY
// ======================================================
async Task TrySetupDatabaseAsync(IServiceProvider services)
{
    try
    {
        using (var migrationScope = services.CreateScope())
        {
            var dbContext = migrationScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            dbContext.Database.Migrate();
            Console.WriteLine("Database migrations applied successfully.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"WARNING: Could not apply database migrations (will retry in background): {ex.Message}");
        return;
    }

    // Only seed admin after migrations succeed
    try
    {
        using (var scope = services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var adminConfig = builder.Configuration.GetSection("AdminUser");
            var adminEmail = adminConfig["Email"];
            var adminPassword = adminConfig["Password"];

            if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword))
            {
                // 1) Ensure the "Admin" role exists (Identity roles are seeded on startup too).
                const string adminRoleName = "Admin";
                if (!await roleManager.RoleExistsAsync(adminRoleName))
                {
                    var roleResult = await roleManager.CreateAsync(new IdentityRole(adminRoleName));
                    Console.WriteLine(roleResult.Succeeded
                        ? $"Admin role created: {adminRoleName}"
                        : $"Failed to create Admin role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }

                // 2) Ensure the admin user exists.
                var existingUser = await userManager.FindByEmailAsync(adminEmail);
                if (existingUser == null)
                {
                    var adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true,
                        FirstName = adminConfig["FirstName"] ?? "Zola",
                        LastName = adminConfig["LastName"] ?? "Mzozoyana"
                    };
                    var createResult = await userManager.CreateAsync(adminUser, adminPassword);
                    if (createResult.Succeeded)
                    {
                        Console.WriteLine($"Admin user created: {adminEmail}");
                    }
                    else
                    {
                        Console.WriteLine($"Failed to create admin user {adminEmail}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                    }
                }
                else
                {
                    // Update existing user's credentials and name if configured
                    var needsUpdate = false;

                    if (!string.IsNullOrWhiteSpace(adminConfig["FirstName"]) &&
                        existingUser.FirstName != adminConfig["FirstName"])
                    {
                        existingUser.FirstName = adminConfig["FirstName"];
                        needsUpdate = true;
                    }

                    if (!string.IsNullOrWhiteSpace(adminConfig["LastName"]) &&
                        existingUser.LastName != adminConfig["LastName"])
                    {
                        existingUser.LastName = adminConfig["LastName"];
                        needsUpdate = true;
                    }

                    if (needsUpdate)
                    {
                        await userManager.UpdateAsync(existingUser);
                    }

                    // Always reset password to configured value to ensure login works
                    var passwordResetToken = await userManager.GeneratePasswordResetTokenAsync(existingUser);
                    var passwordResult = await userManager.ResetPasswordAsync(existingUser, passwordResetToken, adminPassword);
                    if (!passwordResult.Succeeded)
                    {
                        Console.WriteLine($"Failed to reset password for {adminEmail}: {string.Join(", ", passwordResult.Errors.Select(e => e.Description))}");
                    }
                    else
                    {
                        Console.WriteLine($"Admin user password updated: {adminEmail}");
                    }
                }

                // 3) Ensure the admin user is a member of the "Admin" role.
                var adminForRole = await userManager.FindByEmailAsync(adminEmail);
                if (adminForRole != null && !await userManager.IsInRoleAsync(adminForRole, adminRoleName))
                {
                    var addRoleResult = await userManager.AddToRoleAsync(adminForRole, adminRoleName);
                    Console.WriteLine(addRoleResult.Succeeded
                        ? $"Admin user added to '{adminRoleName}' role: {adminEmail}"
                        : $"Failed to add admin user to role: {string.Join(", ", addRoleResult.Errors.Select(e => e.Description))}");
                }
            }
        }

        // 4) Books (transaction ledger): make the physical database the source of
        //    truth. If the table is empty, import the existing books.csv file (so
        //    the data edited via the dashboard is preserved), otherwise seed from
        //    the built-in seed data. Runs only after migrations succeed.
        using (var booksScope = services.CreateScope())
        {
            var booksDb = booksScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var booksCsvService = booksScope.ServiceProvider.GetRequiredService<IBooksCsvService>();

            if (!await booksDb.TransactionLedgers.AsNoTracking().AnyAsync())
            {
                List<BooksCsvRow> rows;
                if (booksCsvService.Exists())
                {
                    rows = await booksCsvService.ParseRowsAsync(await booksCsvService.ReadCsvAsync());
                    Console.WriteLine($"Books: importing {rows.Count} rows from books.csv into the database.");
                }
                else
                {
                    rows = TransactionLedgerSeedData.Rows.Select(BooksCsvMapper.ToRow).ToList();
                    Console.WriteLine($"Books: seeding {rows.Count} rows from seed data into the database.");
                }

                booksDb.TransactionLedgers.AddRange(rows.Select(BooksCsvMapper.FromRow));
                await booksDb.SaveChangesAsync();
                Console.WriteLine("Books table is ready in the database.");
            }
        }

        Console.WriteLine("Database setup completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"WARNING: Could not seed admin user (will retry in background): {ex.Message}");
    }
}

/// <summary>
/// Seeds the Books CSV file (stored on the API server — no database) from the known
/// seed data the first time the file does not exist. Runs independently of the database.
/// </summary>
async Task TryEnsureBooksCsvAsync(IServiceProvider services)
{
    try
    {
        using var scope = services.CreateScope();
        var booksCsvService = scope.ServiceProvider.GetRequiredService<IBooksCsvService>();
        if (!booksCsvService.Exists())
        {
            var rows = TransactionLedgerSeedData.Rows.Select(BooksCsvMapper.ToRow).ToArray();
            await booksCsvService.WriteRowsAsync(rows);
            Console.WriteLine($"Seeded books.csv with {rows.Length} rows.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"WARNING: Could not seed books.csv (will retry in background): {ex.Message}");
    }
}

// Attempt initial setup
await TrySetupDatabaseAsync(app.Services);
await TryEnsureBooksCsvAsync(app.Services);

// Start background retry loop — every 30s, keep trying until setup succeeds.
// This makes the API self-healing: if a transient failure occurs, migrations +
// admin seeding will eventually succeed automatically.
_ = Task.Run(async () =>
{
    while (true)
    {
        await Task.Delay(TimeSpan.FromSeconds(30));
        try
        {
            await TrySetupDatabaseAsync(app.Services);
            await TryEnsureBooksCsvAsync(app.Services);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WARNING: Background database setup retry failed: {ex.Message}");
        }
    }
});

// ======================================================
// OPEN API (DEV ONLY)
// ======================================================
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            var exceptionHandler = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
            if (exceptionHandler?.Error != null)
            {
                var problemDetails = new
                {
                    status = 500,
                    title = "Internal Server Error",
                    detail = exceptionHandler.Error.Message
                };
                await context.Response.WriteAsJsonAsync(problemDetails);
            }
        });
    });
}

// ======================================================
// HTTPS + AUTH
// ======================================================
app.UseHttpsRedirection();
app.UseCors("Api");
app.UseAuthentication();
app.UseAuthorization();

// ======================================================
// HANGFIRE DASHBOARD (IMPORTANT FOR MONITORING)
// ======================================================
app.UseHangfireDashboard("/hangfire");

// ======================================================
// SCHEDULED JOB (EVERY 24 HOURS)
// ======================================================
RecurringJob.AddOrUpdate<ILeadExtractionService>(
    "extract-leads-daily-job",
    service => service.ExtractLeadsFromTodayMessagesAsync(),
    Cron.Daily);

// ======================================================
// ROOT ENDPOINT - HEALTH CHECK
// ======================================================
app.MapGet("/", () => Results.Ok(new
{
    status = "ok",
    message = "HlumisaProperties API is running correctly.",
    time = DateTime.UtcNow
}));

// ======================================================
// HEALTH CHECK ENDPOINT - REPORTS DB CONNECTIVITY
// ======================================================
app.MapGet("/health", async (ApplicationDbContext dbContext) =>
{
    try
    {
        await dbContext.Database.CanConnectAsync();
        return Results.Ok(new { status = "healthy", database = "connected", time = DateTime.UtcNow });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new { status = "degraded", database = "unavailable", error = ex.Message, time = DateTime.UtcNow },
            statusCode: 503);
    }
});

// ======================================================
// CONTROLLERS
// ======================================================
app.MapControllers();

app.Run();
