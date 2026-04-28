using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using TopIT.Core.Entities;
using TopIT.Infrastructure.Data;

namespace TopIT.API.Data
{
    /// <summary>
    /// Tự động tạo tài khoản Admin mặc định khi khởi động ứng dụng
    /// nếu chưa tồn tại user nào có Role = "Admin" trong Database.
    /// </summary>
    public static class DataSeeder
    {
        public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Kiểm tra xem đã có Admin chưa
            bool adminExists = await context.Users.AnyAsync(u => u.Role == "Admin");
            if (adminExists) return;

            // Tạo Admin mặc định
            const string adminEmail = "admin@topit.vn";
            const string adminPassword = "Admin@TopIT2025!";

            CreatePasswordHash(adminPassword, out byte[] passwordHash, out byte[] passwordSalt);

            var adminUser = new User
            {
                FullName = "System Administrator",
                Email = adminEmail,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = "Admin"
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            Console.WriteLine("==============================================");
            Console.WriteLine("[DataSeeder] Đã tạo tài khoản Admin mặc định.");
            Console.WriteLine($"  Email   : {adminEmail}");
            Console.WriteLine($"  Password: {adminPassword}");
            Console.WriteLine("  ⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập!");
            Console.WriteLine("==============================================");
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
