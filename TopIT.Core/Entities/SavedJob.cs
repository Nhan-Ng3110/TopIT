using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TopIT.Core.Entities
{
    public class SavedJob
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int JobId { get; set; }
        public Job Job { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.Now;
    }
}
