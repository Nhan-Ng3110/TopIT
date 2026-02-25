using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
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

        public async Task<IEnumerable<Job>> SearchJobAsync(string? keyWord, string? location)
        {
            IQueryable<Job> query = _context.Jobs.Include(j => j.Company);
            if (!string.IsNullOrWhiteSpace(keyWord))
            {
                query = query.Where(j => j.Title.Contains(keyWord) || j.Description != null && j.Description.Contains(keyWord));
            }

            if (!string.IsNullOrWhiteSpace(location))
            {
                query = query.Where(j => j.Location.Contains(location));
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
