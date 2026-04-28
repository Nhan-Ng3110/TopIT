using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;
using TopIT.Infrastructure.Data;

namespace TopIT.Infrastructure.Repositories
{
    public class ConsultationRequestRepository : IConsultationRequestRepository
    {
        private readonly AppDbContext _context;

        public ConsultationRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ConsultationRequest> AddAsync(ConsultationRequest request)
        {
            _context.ConsultationRequests.Add(request);
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<IEnumerable<ConsultationRequest>> GetAllPendingAsync()
        {
            return await _context.ConsultationRequests
                .Where(x => x.Status == "Pending")
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<ConsultationRequest> GetByIdAsync(int id)
        {
            return await _context.ConsultationRequests.FindAsync(id);
        }

        public async Task UpdateAsync(ConsultationRequest request)
        {
            _context.ConsultationRequests.Update(request);
            await _context.SaveChangesAsync();
        }
    }
}
