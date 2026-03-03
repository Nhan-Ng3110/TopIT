using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TopIT.Core.DTOs
{
    public class UserDTO
    {
        public class JobResponseDto
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string CompanyName { get; set; }
        }
    }
}
