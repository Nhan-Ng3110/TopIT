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


    }
}
