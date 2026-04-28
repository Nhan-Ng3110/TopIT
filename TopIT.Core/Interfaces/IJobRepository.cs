using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TopIT.Core.DTOs;
using TopIT.Core.Entities;

namespace TopIT.Core.Interfaces
{
    public interface IJobRepository
    {
        Task<IEnumerable<Job>> SearchJobAsync(JobSearchDto searchDto);
        Task<Job?> GetByIDAsync(int id);
        Task AddAsync(Job job);

        Task<IEnumerable<Job>> GetAllAsync();
        
        // Saved Jobs
        Task<bool> ToggleSaveJobAsync(int userId, int jobId);
        Task<IEnumerable<SavedJob>> GetSavedJobsAsync(int userId);
        Task<bool> IsJobSavedAsync(int userId, int jobId);

        // Viewed Jobs
        Task TrackViewJobAsync(int userId, int jobId);
        Task<IEnumerable<ViewedJob>> GetViewedJobsAsync(int userId);

        // Employer specialized methods
        Task<IEnumerable<Job>> GetJobsByCompanyIdAsync(int companyId);
        Task<IEnumerable<EmployerJobDto>> GetEmployerJobsWithCountAsync(int companyId);
        Task UpdateAsync(Job job);
        Task DeleteAsync(int id);
    }
}
