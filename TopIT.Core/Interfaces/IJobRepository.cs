using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TopIT.Core.Entities;

namespace TopIT.Core.Interfaces
{
    public interface IJobRepository
    {
        Task<IEnumerable<Job>> SearchJobAsync(string? keyWord, string? location);
        Task<Job?> GetByIDAsync(int id);
        Task AddAsync(Job job);


    }
}
