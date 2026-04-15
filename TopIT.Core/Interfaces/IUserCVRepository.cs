using System.Collections.Generic;
using System.Threading.Tasks;
using TopIT.Core.Entities;

namespace TopIT.Core.Interfaces
{
    public interface IUserCVRepository
    {
        Task<IEnumerable<UserCV>> GetByUserIdAsync(int userId);
        Task<UserCV> GetByIdAsync(int id);
        Task<UserCV> AddAsync(UserCV userCV);
        Task<bool> DeleteAsync(int id);
        Task<bool> SetDefaultAsync(int userId, int cvId);
        Task<int> GetCountByUserIdAsync(int userId);
    }
}
