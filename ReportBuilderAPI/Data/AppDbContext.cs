using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<Template> Templates { get; set; }
        public DbSet<EventLog> EventLogs { get; set; }
        public DbSet<ExcelUpload> ExcelUploads { get; set; }
        public DbSet<ReportSubmission> ReportSubmissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de relaciones

            modelBuilder.Entity<User>()
             .HasOne(u => u.Area)
             .WithMany()
             .HasForeignKey(u => u.AreaId)
             .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EventLog>()
                .HasOne(e => e.Area)
                .WithMany()
                .HasForeignKey(e => e.AreaId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
