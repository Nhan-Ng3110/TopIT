using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;
using TopIT.Infrastructure.Data;

namespace TopIT.Infrastructure.Repositories
{
    public class UserCVRepository : IUserCVRepository
    {
        private readonly AppDbContext _context;

        public UserCVRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserCV>> GetByUserIdAsync(int userId)
        {
            return await _context.UserCVs
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.UploadDate)
                .ToListAsync();
        }

        public async Task<UserCV> GetByIdAsync(int id)
        {
            return await _context.UserCVs.FindAsync(id);
        }

        public async Task<UserCV> AddAsync(UserCV userCV)
        {
            // Nếu là CV đầu tiên, đặt làm mặc định
            var count = await GetCountByUserIdAsync(userCV.UserId);
            if (count == 0) userCV.IsDefault = true;

            await _context.UserCVs.AddAsync(userCV);
            await _context.SaveChangesAsync();
            return userCV;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var cv = await _context.UserCVs.FindAsync(id);
            if (cv == null) return false;

            _context.UserCVs.Remove(cv);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SetDefaultAsync(int userId, int cvId)
        {
            var userCVs = await _context.UserCVs
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var targetCV = userCVs.FirstOrDefault(x => x.Id == cvId);
            if (targetCV == null) return false;

            foreach (var cv in userCVs)
            {
                cv.IsDefault = (cv.Id == cvId);
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<int> GetCountByUserIdAsync(int userId)
        {
            return await _context.UserCVs.CountAsync(x => x.UserId == userId);
        }
    }
}
