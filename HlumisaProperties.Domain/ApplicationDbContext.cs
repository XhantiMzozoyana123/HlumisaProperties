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
        public DbSet<Agent> Agents { get; set; }
        public DbSet<AgentBankAccount> AgentBankAccounts { get; set; }
        public DbSet<ContactBook> ContactBooks { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Lead> Leads { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<PropertyListing> PropertyListings { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<FacebookMessage> FacebookMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Agent Indexes
            modelBuilder.Entity<Agent>()
                .HasIndex(a => a.Email)
                .IsUnique()
                .HasDatabaseName("IX_Agent_Email");

            modelBuilder.Entity<Agent>()
                .HasIndex(a => a.PhoneNumber)
                .HasDatabaseName("IX_Agent_PhoneNumber");

            modelBuilder.Entity<Agent>()
                .HasIndex(a => a.Location)
                .HasDatabaseName("IX_Agent_Location");

            modelBuilder.Entity<Agent>()
                .HasIndex(a => a.IsAvailable)
                .HasDatabaseName("IX_Agent_IsAvailable");

            // AgentBankAccount Indexes
            modelBuilder.Entity<AgentBankAccount>()
                .HasIndex(a => a.AgentId)
                .HasDatabaseName("IX_AgentBankAccount_AgentId");

            modelBuilder.Entity<AgentBankAccount>()
                .HasIndex(a => a.AccountNumber)
                .HasDatabaseName("IX_AgentBankAccount_AccountNumber");

            // Customer Indexes
            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.EmailAddress)
                .HasDatabaseName("IX_Customer_EmailAddress");

            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.PhoneNumber)
                .HasDatabaseName("IX_Customer_PhoneNumber");

            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Location)
                .HasDatabaseName("IX_Customer_Location");

            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.InterestType)
                .HasDatabaseName("IX_Customer_InterestType");

            // Lead Indexes
            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.EmailAddress)
                .HasDatabaseName("IX_Lead_EmailAddress");

            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.PhoneNumber)
                .HasDatabaseName("IX_Lead_PhoneNumber");

            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.Location)
                .HasDatabaseName("IX_Lead_Location");

            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.LeadType)
                .HasDatabaseName("IX_Lead_LeadType");

            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.IsContacted)
                .HasDatabaseName("IX_Lead_IsContacted");

            // ContactBook Indexes
            modelBuilder.Entity<ContactBook>()
                .HasIndex(cb => cb.CustomerId)
                .HasDatabaseName("IX_ContactBook_CustomerId");

            modelBuilder.Entity<ContactBook>()
                .HasIndex(cb => cb.AgentId)
                .HasDatabaseName("IX_ContactBook_AgentId");

            modelBuilder.Entity<ContactBook>()
                .HasIndex(cb => cb.IsResolved)
                .HasDatabaseName("IX_ContactBook_IsResolved");

            modelBuilder.Entity<ContactBook>()
                .HasIndex(cb => new { cb.CustomerId, cb.AgentId })
                .HasDatabaseName("IX_ContactBook_Customer_Agent");

            // PropertyListing Indexes
            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => pl.AgentId)
                .HasDatabaseName("IX_PropertyListing_AgentId");

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

            // Meeting Indexes
            modelBuilder.Entity<Meeting>()
                .HasIndex(m => m.AgentId)
                .HasDatabaseName("IX_Meeting_AgentId");

            modelBuilder.Entity<Meeting>()
                .HasIndex(m => m.CustomerId)
                .HasDatabaseName("IX_Meeting_CustomerId");

            modelBuilder.Entity<Meeting>()
                .HasIndex(m => m.ScheduledDate)
                .HasDatabaseName("IX_Meeting_ScheduledDate");

            modelBuilder.Entity<Meeting>()
                .HasIndex(m => m.Status)
                .HasDatabaseName("IX_Meeting_Status");

            modelBuilder.Entity<Meeting>()
                .HasIndex(m => new { m.AgentId, m.ScheduledDate })
                .HasDatabaseName("IX_Meeting_Agent_Date");

            modelBuilder.Entity<Meeting>()
                .HasIndex(m => new { m.CustomerId, m.ScheduledDate })
                .HasDatabaseName("IX_Meeting_Customer_Date");

            // Composite indexes for common queries
            modelBuilder.Entity<PropertyListing>()
                .HasIndex(pl => new { pl.IsAvailable, pl.Location })
                .HasDatabaseName("IX_PropertyListing_Available_Location");

            // ====== RELATIONSHIP CONSTRAINTS ======

            // Agent -> AgentBankAccount (One-to-Many)
            modelBuilder.Entity<Agent>()
                .HasMany(a => a.Contacts)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AgentBankAccount>()
                .HasOne(aba => aba.Agent)
                .WithMany()
                .HasForeignKey(aba => aba.AgentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_AgentBankAccount_Agent_AgentId");

            // Customer -> ContactBook (One-to-Many)
            modelBuilder.Entity<Customer>()
                .HasMany(c => c.Contacts)
                .WithOne(cb => cb.Customer)
                .HasForeignKey(cb => cb.CustomerId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ContactBook_Customer_CustomerId");

            // Agent -> ContactBook (One-to-Many)
            modelBuilder.Entity<Agent>()
                .HasMany<ContactBook>()
                .WithOne(cb => cb.Agent)
                .HasForeignKey(cb => cb.AgentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ContactBook_Agent_AgentId");

            // Agent -> PropertyListing (One-to-Many)
            modelBuilder.Entity<Agent>()
                .HasMany<PropertyListing>()
                .WithOne(pl => pl.Agent)
                .HasForeignKey(pl => pl.AgentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_PropertyListing_Agent_AgentId");

            // Lead -> PropertyListing (One-to-Many)
            modelBuilder.Entity<Lead>()
                .HasMany<PropertyListing>()
                .WithOne(pl => pl.Lead)
                .HasForeignKey(pl => pl.LeadId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_PropertyListing_Lead_LeadId");

            // Agent -> Meeting (One-to-Many)
            modelBuilder.Entity<Agent>()
                .HasMany<Meeting>()
                .WithOne(m => m.Agent)
                .HasForeignKey(m => m.AgentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Meeting_Agent_AgentId");

            // Customer -> Meeting (One-to-Many)
            modelBuilder.Entity<Customer>()
                .HasMany<Meeting>()
                .WithOne(m => m.Customer)
                .HasForeignKey(m => m.CustomerId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Meeting_Customer_CustomerId");

            // PropertyListing -> Meeting (One-to-Many, Optional)
            modelBuilder.Entity<PropertyListing>()
                .HasMany<Meeting>()
                .WithOne(m => m.PropertyListing)
                .HasForeignKey(m => m.PropertyListingId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Meeting_PropertyListing_PropertyListingId");

            // Configure Property Constraints

            // Agent Property Constraints
            modelBuilder.Entity<Agent>(eb =>
            {
                eb.Property(a => a.FirstName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(a => a.LastName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(a => a.Email)
                    .HasMaxLength(255)
                    .IsRequired();

                eb.Property(a => a.PhoneNumber)
                    .HasMaxLength(20);

                eb.Property(a => a.Location)
                    .HasMaxLength(255);

                eb.Property(a => a.LicenseNumber)
                    .HasMaxLength(50)
                    .IsRequired();

                eb.Property(a => a.Bio)
                    .HasMaxLength(1000);

                eb.Property(a => a.LanguagesSpoken)
                    .HasMaxLength(255);

                eb.Property(a => a.YearsOfExperience)
                    .HasDefaultValue(0);

                eb.Property(a => a.IsAvailable)
                    .HasDefaultValue(true);
            });

            // Customer Property Constraints
            modelBuilder.Entity<Customer>(eb =>
            {
                eb.Property(c => c.FirstName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(c => c.LastName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(c => c.EmailAddress)
                    .HasMaxLength(255);

                eb.Property(c => c.PhoneNumber)
                    .HasMaxLength(20);

                eb.Property(c => c.Location)
                    .HasMaxLength(255);

                eb.Property(c => c.InterestType)
                    .HasDefaultValue(CustomerType.Buying);
            });

            // Lead Property Constraints
            modelBuilder.Entity<Lead>(eb =>
            {
                eb.Property(l => l.FirstName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(l => l.LastName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(l => l.EmailAddress)
                    .HasMaxLength(255);

                eb.Property(l => l.PhoneNumber)
                    .HasMaxLength(20);

                eb.Property(l => l.Location)
                    .HasMaxLength(255);

                eb.Property(l => l.JsonCommunicationThread)
                    .HasColumnType("longtext");

                eb.Property(l => l.IsContacted)
                    .HasDefaultValue(false);
            });

            // ContactBook Property Constraints
            modelBuilder.Entity<ContactBook>(eb =>
            {
                eb.Property(cb => cb.Message)
                    .HasMaxLength(1000);

                eb.Property(cb => cb.IsResolved)
                    .HasDefaultValue(false);
            });

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
            });

            // Meeting Property Constraints
            modelBuilder.Entity<Meeting>(eb =>
            {
                eb.Property(m => m.Title)
                    .HasMaxLength(255)
                    .IsRequired();

                eb.Property(m => m.Description)
                    .HasMaxLength(1000);

                eb.Property(m => m.Location)
                    .HasMaxLength(255)
                    .IsRequired();

                eb.Property(m => m.MeetingType)
                    .HasMaxLength(100);

                eb.Property(m => m.Status)
                    .HasMaxLength(50)
                    .HasDefaultValue("Scheduled");

                eb.Property(m => m.ScheduledDate)
                    .IsRequired();

                eb.Property(m => m.Duration)
                    .HasDefaultValue(TimeSpan.FromHours(1));
            });

            // AgentBankAccount Property Constraints
            modelBuilder.Entity<AgentBankAccount>(eb =>
            {
                eb.Property(a => a.BankName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(a => a.AccountNumber)
                    .HasMaxLength(50)
                    .IsRequired();

                eb.Property(a => a.AccountHolderName)
                    .HasMaxLength(100)
                    .IsRequired();

                eb.Property(a => a.BranchCode)
                    .HasMaxLength(50);
            });
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
