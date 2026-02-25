using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TopIT.Core.Entities
{
    public class JobApplication
    {
        public int Id  { get; set; }

        public int JobId { get; set; }
        public Job Job { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public string CVPath { get; set; }
        public string? Message { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Pending";





    }
}
