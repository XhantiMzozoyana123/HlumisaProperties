using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
       : base(options)
        {
        }

        // Design-time constructor for migrations
        public ApplicationDbContext() : base(DesignTimeDbContextOptions())
        {
        }

        // DbSets for entities
        public DbSet<PropertyListing> PropertyListings { get; set; }
        public DbSet<Buyer> Buyers { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<FacebookMessage> FacebookMessages { get; set; }
        public DbSet<WhatsAppMessage> WhatsAppMessages { get; set; }
        public DbSet<TransactionLedger> TransactionLedgers { get; set; }
        public DbSet<Referral> Referrals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // PropertyListing Indexes
            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => pl.Location)
                .HasDatabaseName("IX_PropertyListing_Location");

            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => pl.PropertyType)
                .HasDatabaseName("IX_PropertyListing_PropertyType");

            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => pl.ListingType)
                .HasDatabaseName("IX_PropertyListing_ListingType");

            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => pl.Price)
                .HasDatabaseName("IX_PropertyListing_Price");

            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => pl.IsAvailable)
                .HasDatabaseName("IX_PropertyListing_IsAvailable");

            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => new { pl.Location, pl.PropertyType, pl.Price })
                .HasDatabaseName("IX_PropertyListing_Search");

            // Composite indexes for common queries
            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => new { pl.IsAvailable, pl.Location })
                .HasDatabaseName("IX_PropertyListing_Available_Location");

            // Buyer Indexes
            modelBuilder.Entity<Buyer>()
                .HasIndex(b => b.IsDiscarded)
                .HasDatabaseName("IX_Buyer_IsDiscarded");

            modelBuilder.Entity<Buyer>()
                .HasIndex(b => b.IsContacted)
                .HasDatabaseName("IX_Buyer_IsContacted");

            // Seller Indexes
            modelBuilder.Entity<Seller>()
                .HasIndex(s => s.IsDiscarded)
                .HasDatabaseName("IX_Seller_IsDiscarded");

            modelBuilder.Entity<Seller>()
                .HasIndex(s => s.IsContacted)
                .HasDatabaseName("IX_Seller_IsContacted");

            // PropertyListing Property Constraints
            modelBuilder.Entity<PropertyListing>(eb =>
            {
                eb.Property(pl => pl.Title)
                    .HasMaxLength(255)
                    .IsRequired();

                eb.Property(pl => pl.Description)
                    .HasMaxLength(2000);

                eb.Property(pl => pl.PropertyType)
                    .HasMaxLength(50)
                    .IsRequired();

                eb.Property(pl => pl.ListingType)
                    .HasMaxLength(50)
                    .IsRequired();

                eb.Property(pl => pl.Price)
                    .HasPrecision(18, 2)
                    .IsRequired();

                eb.Property(pl => pl.Location)
                    .HasMaxLength(255)
                    .IsRequired();

                eb.Property(pl => pl.Bedrooms)
                    .HasDefaultValue(0);

                eb.Property(pl => pl.Bathrooms)
                    .HasDefaultValue(0);

                eb.Property(pl => pl.SizeInSqm)
                    .HasDefaultValue(0.0);

                eb.Property(pl => pl.IsAvailable)
                    .HasDefaultValue(true);

                eb.Property(pl => pl.ImageBase64)
                    .HasColumnType("longtext")
                    .HasDefaultValue("");

                eb.Property(pl => pl.Images)
                    .HasColumnType("longtext")
                    .HasDefaultValue("[]");

                eb.Property(pl => pl.DateAdded)
                    .HasMaxLength(20);

                eb.Property(pl => pl.Status)
                    .HasMaxLength(50)
                    .HasDefaultValue("on-market");

                eb.Property(pl => pl.SellerName)
                    .HasMaxLength(255);
            });

            // Buyer Property Constraints
            modelBuilder.Entity<Buyer>(eb =>
            {
                eb.Property(b => b.FirstName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(b => b.LastName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(b => b.PhoneNumber)
                    .HasMaxLength(20);

                eb.Property(b => b.Location)
                    .HasMaxLength(255);

                eb.Property(b => b.Budget)
                    .HasMaxLength(100);

                eb.Property(b => b.PropertyType)
                    .HasMaxLength(50);

                eb.Property(b => b.IsContacted)
                    .HasDefaultValue(false);

                eb.Property(b => b.IsDiscarded)
                    .HasDefaultValue(false);
            });

            // Seller Property Constraints
            modelBuilder.Entity<Seller>(eb =>
            {
                eb.Property(s => s.FirstName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(s => s.LastName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(s => s.PhoneNumber)
                    .HasMaxLength(20);

                eb.Property(s => s.Location)
                    .HasMaxLength(255);

                eb.Property(s => s.PropertyType)
                    .HasMaxLength(50);

                eb.Property(s => s.EstimatedValue)
                    .HasMaxLength(100);

                eb.Property(s => s.IsContacted)
                    .HasDefaultValue(false);

                eb.Property(s => s.IsDiscarded)
                    .HasDefaultValue(false);

                eb.Property(s => s.StatusColor)
                    .HasMaxLength(20)
                    .HasDefaultValue("white");
            });

            // TransactionLedger Property Constraints
            modelBuilder.Entity<TransactionLedger>(eb =>
            {
                eb.Property(t => t.Date)
                    .IsRequired();

                eb.Property(t => t.Month)
                    .HasMaxLength(20)
                    .IsRequired();

                eb.Property(t => t.Buyer)
                    .HasMaxLength(255);

                eb.Property(t => t.Seller)
                    .HasMaxLength(255);

                eb.Property(t => t.OriginalAmount)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.DueToSeller)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.Deposit)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.LostDeed)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.Commission)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.TransferCosts)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.MasterFees)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.ElecCert)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.WaterAccount)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.Section118)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.Balance)
                    .HasPrecision(18, 2)
                    .HasDefaultValue(0);

                eb.Property(t => t.ErfNumber)
                    .HasMaxLength(100);

                eb.Property(t => t.Area)
                    .HasMaxLength(255);

                eb.Property(t => t.Status)
                    .HasMaxLength(50)
                    .HasDefaultValue("Pending");

                eb.Property(t => t.CellColors)
                    .HasColumnType("longtext")
                    .HasDefaultValue("{}");
            });

            // Referral Indexes
            modelBuilder.Entity<Referral>()
                .HasIndex(r => r.IsDiscarded)
                .HasDatabaseName("IX_Referral_IsDiscarded");

            modelBuilder.Entity<Referral>()
                .HasIndex(r => r.Intent)
                .HasDatabaseName("IX_Referral_Intent");

            // Referral Property Constraints
            modelBuilder.Entity<Referral>(eb =>
            {
                eb.Property(r => r.ReferrerName)
                    .HasMaxLength(255)
                    .IsRequired();

                eb.Property(r => r.ReferrerPhone)
                    .HasMaxLength(50);

                eb.Property(r => r.ReferrerAddress)
                    .HasMaxLength(500);

                eb.Property(r => r.ReferredName)
                    .HasMaxLength(255)
                    .IsRequired();

                eb.Property(r => r.ReferredPhone)
                    .HasMaxLength(50);

                eb.Property(r => r.ReferredAddress)
                    .HasMaxLength(500);

                eb.Property(r => r.Intent)
                    .HasMaxLength(10)
                    .HasDefaultValue("buy");

                eb.Property(r => r.Note)
                    .HasMaxLength(2000);

                eb.Property(r => r.Date)
                    .HasMaxLength(20);

                eb.Property(r => r.IsDiscarded)
                    .HasDefaultValue(false);
            });

            // TransactionLedger Indexes
            modelBuilder.Entity<TransactionLedger>()
                .HasIndex(t => t.Month)
                .HasDatabaseName("IX_TransactionLedger_Month");

            modelBuilder.Entity<TransactionLedger>()
                .HasIndex(t => t.Date)
                .HasDatabaseName("IX_TransactionLedger_Date");

            modelBuilder.Entity<TransactionLedger>()
                .HasIndex(t => t.Status)
                .HasDatabaseName("IX_TransactionLedger_Status");
        }

        private static DbContextOptions<ApplicationDbContext> DesignTimeDbContextOptions()
        {
            // Build the path to the HlumisaProperties.Api project
            var webProjectPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory()).FullName, "HlumisaProperties.Api");

            // Load the configuration from appsettings.json in the .Api project
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(webProjectPath) // Set the base path to the .Api directory
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true) // Load appsettings.json
                .Build();

            var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // MySQL provider (Pomelo)
            builder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            return builder.Options;
        }
    }
}