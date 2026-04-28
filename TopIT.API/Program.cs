using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using TopIT.Infrastructure.Data;
using TopIT.Core.Interfaces;
using TopIT.Infrastructure.Repositories;
using TopIT.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TopIT.Core.Mappings;
using System.Text.Json.Serialization;
using TopIT.API.Hubs;
using TopIT.API.Data;

var builder = WebApplication.CreateBuilder(args);

// ---  CẤU HÌNH CORS  ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") 
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});


builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin() 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IJobRepository, JobRepository>();
builder.Services.AddScoped<IApplicationRepository, ApplicationRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IUserCVRepository, UserCVRepository>();
builder.Services.AddScoped<IConsultationRequestRepository, ConsultationRequestRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddSignalR();

builder.Services.AddAutoMapper(typeof(AutoMapperProfile).Assembly);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("Jwt:Key").Value!)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration.GetSection("Jwt:Issuer").Value,
            ValidateAudience = true,
            ValidAudience = builder.Configuration.GetSection("Jwt:Audience").Value,
            ValidateLifetime = true
        };
    });
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

var app = builder.Build();
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularApp");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

// Seed Admin account if none exists
await DataSeeder.SeedAdminAsync(app.Services);

app.Run();