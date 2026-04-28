using System.Threading.Tasks;

namespace TopIT.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
