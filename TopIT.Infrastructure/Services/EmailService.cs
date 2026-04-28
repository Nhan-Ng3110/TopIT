using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using TopIT.Core.Interfaces;

namespace TopIT.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_config["SmtpSettings:SenderName"], _config["SmtpSettings:SenderEmail"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = body };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            try
            {
                var host = _config["SmtpSettings:Server"];
                var port = int.Parse(_config["SmtpSettings:Port"]);
                var useSsl = bool.Parse(_config["SmtpSettings:UseSsl"]);

                // Mailtrap usually uses StartTls for port 2525
                await smtp.ConnectAsync(host, port, useSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);
                await smtp.AuthenticateAsync(_config["SmtpSettings:Username"], _config["SmtpSettings:Password"]);
                await smtp.SendAsync(email);
                
                Console.WriteLine($"Email sent successfully to {toEmail} via SMTP");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email to {toEmail}: {ex.Message}");
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }
        }
    }
}
