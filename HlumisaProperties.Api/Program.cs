using Hangfire;
using Hangfire.InMemory;
using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Infrastructure.Services;

using HlumisaProperties.Domain;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// CONTROLLERS + OPEN API
// ======================================================
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("LandingPage", policy =>
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin());
});

// ======================================================
// YOUR APPLICATION SERVICES
// ======================================================
// Database (MySQL via Pomelo)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// HTTP clients + Services
builder.Services.AddHttpClient(); // default
builder.Services.AddHttpClient<IFacebookMessengerService, FacebookMessengerService>();
builder.Services.AddHttpClient<ILLMService, LLMService>();

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
// OPEN API (DEV ONLY)
// ======================================================
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ======================================================
// HTTPS + AUTH
// ======================================================
app.UseHttpsRedirection();
app.UseCors("LandingPage");
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
// CONTROLLERS
// ======================================================
app.MapControllers();

app.Run();
