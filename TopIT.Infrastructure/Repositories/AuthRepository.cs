using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;
using TopIT.Infrastructure.Data;

namespace TopIT.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IJwtService _jwtService;

        public AuthRepository(AppDbContext context, IConfiguration configuration, IJwtService jwtService)
        {
            _context = context;
            _configuration = configuration;
            _jwtService = jwtService;
        }

        public async Task<string> Login(string email, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email.Trim().ToLower() == email.Trim().ToLower());

            if (user == null)
            {
                Console.WriteLine($"Không tìm thấy User với email: {email}");
                return null;
            }

            if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
            {
                Console.WriteLine("Tìm thấy User nhưng sai mật khẩu!");
                return null;
            }

            return _jwtService.CreateToken(user);
        }

        public async Task<User> Register(User user, string password)
        {
            byte[] passwordHash, passwordSalt;
            CreatePasswordHash(password, out passwordHash, out passwordSalt);

            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> UserExists(string email)
        {
            if (await _context.Users.AnyAsync(x => x.Email == email))
                return true;

            return false;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(x => x.Email.Trim().ToLower() == email.Trim().ToLower());
        }

        public async Task UpdateUserRole(User user, string role)
        {
            user.Role = role;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }
    }
}
