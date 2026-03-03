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


    }
}
