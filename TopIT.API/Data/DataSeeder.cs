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

            // 1. Tạo Công ty mẫu nếu chưa có
            var defaultCompany = await context.Companies.FirstOrDefaultAsync(c => c.Name == "TopIT Solution");
            if (defaultCompany == null)
            {
                defaultCompany = new Company
                {
                    Name = "TopIT Solution",
                    Description = "Công ty công nghệ hàng đầu Việt Nam",
                    Address = "Hà Nội, Việt Nam",
                    Website = "https://topit.vn",
                    Size = "50-100 nhân viên"
                };
                await context.Companies.AddAsync(defaultCompany);
                await context.SaveChangesAsync();
            }

            // 2. Tạo Admin
            bool adminExists = await context.Users.AnyAsync(u => u.Role == "Admin");
            if (!adminExists)
            {
                CreatePasswordHash("Admin@TopIT2025!", out byte[] adminHash, out byte[] adminSalt);
                var adminUser = new User
                {
                    FullName = "System Administrator",
                    Email = "admin@topit.vn",
                    PasswordHash = adminHash,
                    PasswordSalt = adminSalt,
                    Role = "Admin"
                };
                await context.Users.AddAsync(adminUser);
            }

            // 3. Tạo Employer mẫu
            bool employerExists = await context.Users.AnyAsync(u => u.Email == "employer@topit.vn");
            if (!employerExists)
            {
                CreatePasswordHash("Employer@TopIT2025!", out byte[] empHash, out byte[] empSalt);
                var employerUser = new User
                {
                    FullName = "HR Manager",
                    Email = "employer@topit.vn",
                    PasswordHash = empHash,
                    PasswordSalt = empSalt,
                    Role = "Employer",
                    CompanyId = defaultCompany.Id
                };
                await context.Users.AddAsync(employerUser);
            }

            await context.SaveChangesAsync();
            Console.WriteLine("[DataSeeder] Đã khởi tạo dữ liệu mẫu (Admin & Employer).");
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
