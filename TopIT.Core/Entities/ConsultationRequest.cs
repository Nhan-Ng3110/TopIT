using System;

namespace TopIT.Core.Entities
{
    public class ConsultationRequest
    {
        public int Id { get; set; }
        public string CompanyName { get; set; }
        public string Name { get; set; }
        public string JobPosition { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Source { get; set; }
        public string Note { get; set; }
        public bool AcceptPersonalData { get; set; }
        public bool AcceptNotifications { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
