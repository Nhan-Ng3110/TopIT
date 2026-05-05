using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TopIT.Core.Entities;


namespace TopIT.Infrastructure.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Job> Jobs { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }

        public DbSet<User> Users { get; set; }
        public DbSet<UserCV> UserCVs { get; set; }
        public DbSet<SavedJob> SavedJobs { get; set; }
        public DbSet<ViewedJob> ViewedJobs { get; set; }
        public DbSet<ConsultationRequest> ConsultationRequests { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ngăn cascade delete vòng lặp trên ChatMessage
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasOne(m => m.Sender)
                      .WithMany()
                      .HasForeignKey(m => m.SenderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Receiver)
                      .WithMany()
                      .HasForeignKey(m => m.ReceiverId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Job)
                      .WithMany()
                      .HasForeignKey(m => m.JobId)
                      .OnDelete(DeleteBehavior.SetNull)
                      .IsRequired(false);
            });

            // Ngăn cascade delete của Company -> User
            modelBuilder.Entity<Company>(entity =>
            {
                entity.HasOne(c => c.EmployerUser)
                      .WithMany()
                      .HasForeignKey(c => c.EmployerUserId)
                      .OnDelete(DeleteBehavior.SetNull)
                      .IsRequired(false);
            });
        }
    }
}

