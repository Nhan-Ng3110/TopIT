using System.Collections.Generic;
using System.Threading.Tasks;
using TopIT.Core.Entities;

namespace TopIT.Core.Interfaces
{
    public interface IConsultationRequestRepository
    {
        Task<ConsultationRequest> AddAsync(ConsultationRequest request);
        Task<IEnumerable<ConsultationRequest>> GetAllPendingAsync();
        Task<ConsultationRequest> GetByIdAsync(int id);
        Task UpdateAsync(ConsultationRequest request);
    }
}
