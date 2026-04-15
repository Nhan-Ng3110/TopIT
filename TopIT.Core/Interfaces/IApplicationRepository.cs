using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TopIT.Core.Entities;

namespace TopIT.Core.Interfaces
{
    public interface IApplicationRepository
    {
        Task AddAsync(JobApplication application);
        Task<JobApplication> GetByIdAsync(int id);
        Task<IEnumerable<JobApplication>> GetByJobIdAsync(int JobId);
        Task<IEnumerable<JobApplication>> GetByUserIdAsync(int UserId);

        Task<bool> UpdateStatusAsync(int ApplicationId, string NewStatus);
        Task UpdateAsync(JobApplication application);
        Task DeleteStatusAsync(int ApplicationId);

        Task<bool> HasUserAppliedAsync(int userId, int jobId);
        Task<JobApplication?> GetByUserAndJobAsync(int userId, int jobId);
    }
}
