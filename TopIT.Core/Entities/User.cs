using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TopIT.Core.Entities
{
    public class User
    {
        public int Id {  get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public byte[] PasswordHash { get; set; } = new byte[0];
        public byte[] PasswordSalt { get; set; } = new byte[0];
        public string Role { get; set; } = "Candidate";
        public int? CompanyId { get; set; }


        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();

    }
}
