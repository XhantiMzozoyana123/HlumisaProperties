using Hangfire;
using Hangfire.SqlServer;
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

// ======================================================
// YOUR APPLICATION SERVICES
// ======================================================
builder.Services.AddScoped<IExtractService, ExtractService>();
// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// HTTP clients + Services
builder.Services.AddHttpClient(); // default
builder.Services.AddHttpClient<IFacebookMessengerService, FacebookMessengerService>();
builder.Services.AddHttpClient<ILLMService, LLMService>();

builder.Services.AddScoped<IFacebookMessengerService, FacebookMessengerService>();
builder.Services.AddScoped<ILLMService, LLMService>();

// ======================================================
// HANGFIRE CONFIGURATION
// ======================================================
//builder.Services.AddHangfire(config =>
//{
//    config.UseSimpleAssemblyNameTypeSerializer()
//          .UseRecommendedSerializerSettings()
//          .UseSqlServerStorage(
//              builder.Configuration.GetConnectionString("DefaultConnection"),
//              new SqlServerStorageOptions
//              {
//                  CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
//                  SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
//                  QueuePollInterval = TimeSpan.FromSeconds(15),
//                  UseRecommendedIsolationLevel = true,
//                  DisableGlobalLocks = true
//              });
//});

//builder.Services.AddHangfireServer();

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
app.UseAuthorization();

// ======================================================
// HANGFIRE DASHBOARD (IMPORTANT FOR MONITORING)
// ======================================================
//app.UseHangfireDashboard("/hangfire");

// ======================================================
// SCHEDULED JOB (EVERY 24 HOURS)
// ======================================================
//RecurringJob.AddOrUpdate<IExtractService>(
//    "extract-leads-daily-job",
//    service => service.ExtractLeadsFromMessengerThreadsAsync(
//        app.Configuration["Facebook:PageId"]
//    ),
//    Cron.Daily);

// ======================================================
// CONTROLLERS
// ======================================================
app.MapControllers();

app.Run();