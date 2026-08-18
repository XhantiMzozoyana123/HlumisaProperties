using System.Text;
using Hangfire;
using Hangfire.InMemory;
using HlumisaProperties.Api;
using HlumisaProperties.Application.Interfaces;
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

// ======================================================
// CONTROLLERS + OPEN API
// ======================================================
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    // Landing page (public referral form) — allow all origins
    options.AddPolicy("LandingPage", policy =>
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin());

    // API (admin dashboard, landing page, local dev) — allow known origins
    options.AddPolicy("Api", policy =>
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(origin => true) // Allow all origins (incl. mobile apps / bots)
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
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }
    catch
    {
        // If the DB is temporarily unreachable, fall back to a known version so the app can start.
        // The app will retry DB operations when the database comes back online.
        options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 37)));
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
// AUTO-APPLY DATABASE MIGRATIONS ON STARTUP
// ======================================================
try
{
    using (var migrationScope = app.Services.CreateScope())
    {
        var dbContext = migrationScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("Database migrations applied successfully.");
    }
}
catch (Exception ex)
{
    // Don't crash the API if the DB is temporarily unreachable.
    // Endpoints will return proper 500s until the DB comes back online.
    Console.WriteLine($"WARNING: Could not apply database migrations (continuing anyway): {ex.Message}");
}

// ======================================================
// AUTO-SEED ADMIN USER ON STARTUP
// ======================================================
try
{
    using (var scope = app.Services.CreateScope())
    {
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var adminConfig = builder.Configuration.GetSection("AdminUser");
        var adminEmail = adminConfig["Email"];
        var adminPassword = adminConfig["Password"];

        if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword))
        {
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
                await userManager.CreateAsync(adminUser, adminPassword);
                Console.WriteLine($"Admin user created: {adminEmail}");
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
        }
    }
}
catch (Exception ex)
{
    // Don't crash the API if the DB is temporarily unreachable.
    Console.WriteLine($"WARNING: Could not seed admin user (continuing anyway): {ex.Message}");
}

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
app.MapGet("/", () => Results.Ok("HlumisaProperties API is running correctly."));

// ======================================================
// CONTROLLERS
// ======================================================
app.MapControllers();

app.Run();