using System.Threading.Tasks;
using TopIT.Core.Entities;

namespace TopIT.Core.Interfaces
{
    public interface IJwtService
    {
        string CreateToken(User user);
    }
}
