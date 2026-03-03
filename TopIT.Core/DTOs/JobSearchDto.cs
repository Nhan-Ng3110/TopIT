using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TopIT.Core.DTOs
{
    public class JobSearchDto
    {
        public string? KeyWord { get; set; }
        public string? Location { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string? Level { get; set; }
        public int? ExperienceYears { get; set; }
        public string? JobStyle { get; set; }
    }
}
