using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Data;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ReportBuilderAPI.Utils;
using Microsoft.AspNetCore.Http.Features;
using ReportBuilderAPI.Repositories.Interfaces;
using ReportBuilderAPI.Repositories.Implementations;
using ReportBuilderAPI.Service.Interface;
using ReportBuilderAPI.Service.Implementations;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Implementation;
using ReportBuilderAPI.Services.MCP.Interfaces;
using ReportBuilderAPI.Services.MCP.Implementation;
using ReportBuilderAPI.Services.Vector.Interfaces;
using ReportBuilderAPI.Services.Vector.Implementation;
using ReportBuilderAPI.Services.Data.Interfaces;
using ReportBuilderAPI.Services.Data.Implementation;

var builder = WebApplication.CreateBuilder(args);

// Cargar variables de entorno
builder.Configuration.AddEnvironmentVariables();

// Configurar DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        Environment.GetEnvironmentVariable("DB_HOST") != null &&
        Environment.GetEnvironmentVariable("DB_NAME") != null &&
        Environment.GetEnvironmentVariable("DB_USER") != null &&
        Environment.GetEnvironmentVariable("DB_PASSWORD") != null
            ? $"Host={Environment.GetEnvironmentVariable("DB_HOST")};Database={Environment.GetEnvironmentVariable("DB_NAME")};Username={Environment.GetEnvironmentVariable("DB_USER")};Password={Environment.GetEnvironmentVariable("DB_PASSWORD")}"
            : builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Registrar repositorios
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Configuración AI
builder.Services.Configure<ReportBuilderAPI.Configuration.AISettings>(builder.Configuration.GetSection("AISettings"));
builder.Services.AddHttpClient<IDeepSeekService, DeepSeekService>();
builder.Services.AddHttpClient<IAnthropicService, AnthropicService>();


// Registrar servicios
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IJWTUtils, JWTUtils>();
builder.Services.AddScoped<IUserService, UserService>();

// Registrar servicios AI
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<INarrativeService, NarrativeService>();
builder.Services.AddScoped<IDataProcessingService, DataProcessingService>();

// Registrar servicios Vector
builder.Services.AddSingleton<IVectorService, VectorService>();

// Registrar servicios MCP
builder.Services.AddHttpClient<IMCPClientService, MCPClientService>();

// Agregar controladores
builder.Services.AddControllers()
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = null;
});

// Configurar autenticacion con JWT
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
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            Environment.GetEnvironmentVariable("JWT_SECRET") ?? builder.Configuration["JwtSettings:SecretKey"]!
        ))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
    options.AddPolicy("ManagerOnly", policy => policy.RequireRole("Manager"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// Agregar CORS para permitir solicitudes del frontend
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins, policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // More permissive CORS for development
            policy
                .SetIsOriginAllowed(origin => true) // Allow any origin in development
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            // Restrictive CORS for production
            policy
                .WithOrigins("http://localhost:5173", "https://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetIsOriginAllowedToAllowWildcardSubdomains();
        }
    });
});

// Configurar Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ReportBuilderProject",
        Version = "v1",
        Description = "Plantilla para generar informes.",
        Contact = new OpenApiContact
        {
            Name = "Jaime Gallo",
            Email = "jagallob@eafit.edu.co",

        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});




//Para archivos pesados
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 50 * 1024 * 1024; // 50 MB
});

var app = builder.Build();

// Inicializar servicios AI
using (var scope = app.Services.CreateScope())
{
    try
    {
        var vectorService = scope.ServiceProvider.GetRequiredService<IVectorService>();
        await vectorService.InitializeAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Vector service initialization failed: {ex.Message}");
    }

    try
    {
        var mcpService = scope.ServiceProvider.GetRequiredService<IMCPClientService>();
        await mcpService.InitializeAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: MCP service initialization failed: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Habilitar Swagger
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ReportBuilderProject v1");
        options.RoutePrefix = "swagger"; // Ruta base para la interfaz de Swagger
    });
}

// Apply CORS before HTTPS redirection to prevent redirect issues with preflight requests
app.UseCors(MyAllowSpecificOrigins);

// Disable HTTPS redirection completely in development to prevent CORS issues
// if (!app.Environment.IsDevelopment())
// {
//     app.UseHttpsRedirection();
// }

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseStaticFiles(); // permite servir archivos como /uploads/*

app.Run();
