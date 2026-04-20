using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TopIT.Core.DTOs;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;
using TopIT.Infrastructure.Data;
using TopIT.Infrastructure.Migrations;

namespace TopIT.Infrastructure.Repositories
{
    public class JobRepository: IJobRepository
    {
        private readonly AppDbContext _context;
        public JobRepository(AppDbContext context) { _context = context; }

        public async Task<IEnumerable<Job>> SearchJobAsync(JobSearchDto searchDto)
        {
            IQueryable<Job> query = _context.Jobs
                .Include(j => j.Company)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchDto.KeyWord))
            {
                query = query.Where(j => j.Title.Contains(searchDto.KeyWord) || (j.Description != null && j.Description.Contains(searchDto.KeyWord)));
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Location))
            {
                query = query.Where(j => j.Location.Contains(searchDto.Location));
            }

            
            if (searchDto.SalaryMin.HasValue) query = query.Where(j => j.SalaryMax >= searchDto.SalaryMin.Value);
            if (searchDto.SalaryMax.HasValue) query = query.Where(j => j.SalaryMin <= searchDto.SalaryMax.Value);

            if (!string.IsNullOrWhiteSpace(searchDto.Level))
            {
                query = query.Where(j => j.Level.Contains(searchDto.Level));
            }

            if (searchDto.ExperienceYears.HasValue)
            {
                
                query = query.Where(j => j.ExperienceYears <= searchDto.ExperienceYears.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.JobStyle))
            {
                query = query.Where(j => j.JobType.Contains(searchDto.JobStyle));
            }

      
            return await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
        }

        public async Task<Job?> GetByIDAsync(int id)
        {
            return await _context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Id == id);
        }
        public async Task AddAsync(Job job)
        {
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Job>> GetAllAsync()
        {
            return await _context.Jobs.ToListAsync();
        }

        // --- Saved Jobs Implementation ---

        public async Task<bool> ToggleSaveJobAsync(int userId, int jobId)
        {
            var existing = await _context.SavedJobs
                .FirstOrDefaultAsync(s => s.UserId == userId && s.JobId == jobId);

            if (existing != null)
            {
                _context.SavedJobs.Remove(existing);
                await _context.SaveChangesAsync();
                return false; // Result is NOT saved
            }
            else
            {
                var newSaved = new SavedJob { UserId = userId, JobId = jobId, SavedAt = DateTime.Now };
                await _context.SavedJobs.AddAsync(newSaved);
                await _context.SaveChangesAsync();
                return true; // Result is saved
            }
        }

        public async Task<IEnumerable<SavedJob>> GetSavedJobsAsync(int userId)
        {
            return await _context.SavedJobs
                .Include(s => s.Job)
                    .ThenInclude(j => j.Company)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.SavedAt)
                .ToListAsync();
        }

        public async Task<bool> IsJobSavedAsync(int userId, int jobId)
        {
            return await _context.SavedJobs.AnyAsync(s => s.UserId == userId && s.JobId == jobId);
        }

        // --- Viewed Jobs Implementation ---

        public async Task TrackViewJobAsync(int userId, int jobId)
        {
            var existing = await _context.ViewedJobs
                .FirstOrDefaultAsync(v => v.UserId == userId && v.JobId == jobId);

            if (existing != null)
            {
                existing.ViewedAt = DateTime.Now;
                _context.ViewedJobs.Update(existing);
            }
            else
            {
                var newView = new ViewedJob { UserId = userId, JobId = jobId, ViewedAt = DateTime.Now };
                await _context.ViewedJobs.AddAsync(newView);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ViewedJob>> GetViewedJobsAsync(int userId)
        {
            return await _context.ViewedJobs
                .Include(v => v.Job)
                    .ThenInclude(j => j.Company)
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.ViewedAt)
                .Take(20) // Limit to 20 as requested
                .ToListAsync();
        }

        // --- Employer specialized methods ---

        public async Task<IEnumerable<Job>> GetJobsByCompanyIdAsync(int companyId)
        {
            return await _context.Jobs
                .Include(j => j.Company)
                .Where(j => j.CompanyId == companyId)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateAsync(Job job)
        {
            _context.Jobs.Update(job);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job != null)
            {
                _context.Jobs.Remove(job);
                await _context.SaveChangesAsync();
            }
        }
    }
}
