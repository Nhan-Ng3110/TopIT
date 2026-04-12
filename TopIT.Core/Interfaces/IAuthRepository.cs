using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TopIT.Core.Entities;

namespace TopIT.Core.Interfaces
{
    public interface IAuthRepository
    {
        Task<User> Register(User user, string password);
        Task<string> Login(string email, string password);
        Task<bool> UserExists(string email);
    }
}
