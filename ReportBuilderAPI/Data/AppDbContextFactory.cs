using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;

namespace ReportBuilderAPI.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddEnvironmentVariables()
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            // Permitir sobreescribir la cadena de conexión con variables de entorno
            var envHost = Environment.GetEnvironmentVariable("DB_HOST");
            var envDb = Environment.GetEnvironmentVariable("DB_NAME");
            var envUser = Environment.GetEnvironmentVariable("DB_USER");
            var envPass = Environment.GetEnvironmentVariable("DB_PASSWORD");
            if (!string.IsNullOrEmpty(envHost) && !string.IsNullOrEmpty(envDb) && !string.IsNullOrEmpty(envUser) && !string.IsNullOrEmpty(envPass))
            {
                connectionString = $"Host={envHost};Database={envDb};Username={envUser};Password={envPass}";
            }
            optionsBuilder.UseNpgsql(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
