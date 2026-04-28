using System;
using TopIT.Core.Entities;

namespace TopIT.Core.DTOs
{
    public class EmployerJobDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public bool? IsNegotiable { get; set; }
        public string Level { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int ApplicationCount { get; set; }
    }
}
