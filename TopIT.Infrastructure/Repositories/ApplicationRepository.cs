using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;
using TopIT.Infrastructure.Data;

namespace TopIT.Infrastructure.Repositories
{
    public class ApplicationRepository:IApplicationRepository
    {
        private readonly AppDbContext _context;
        public ApplicationRepository(AppDbContext context) { _context = context; }

        public async Task AddAsync(JobApplication application)
        {
           await _context.JobApplications.AddAsync(application);
           await _context.SaveChangesAsync();
        }
        public async Task<JobApplication> GetByIdAsync(int id)
        {
            return await _context.JobApplications.Include(a => a.Job).Include(a => a.User).FirstOrDefaultAsync(a=>a.Id == id);
        }
        public async Task<IEnumerable<JobApplication>> GetByJobIdAsync(int JobId)
        {
            return await _context.JobApplications.Where(j => j.JobId == JobId).Include(j=> j.User).ToListAsync();
        }
        public async Task<IEnumerable<JobApplication>> GetByUserIdAsync(int UserId)
        {
            return await _context.JobApplications.Where(j => j.UserId == UserId).Include(j=> j.User).ToListAsync();
        }

        public async Task<bool> UpdateStatusAsync(int ApplicationId, string NewStatus)
        {
            var app = await _context.JobApplications.FindAsync(ApplicationId);
            if (app == null) return false; 

            app.Status = NewStatus;
            await _context.SaveChangesAsync();
            return true; 
        }

        public async Task DeleteStatusAsync(int ApplicationId)
        {
            JobApplication app = await _context.JobApplications.FindAsync(ApplicationId);

            if (app!= null)
            {
                _context.JobApplications.Remove(app);
                await _context.SaveChangesAsync();
            }    
        }



    }
}
