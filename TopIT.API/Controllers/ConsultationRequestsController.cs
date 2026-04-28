using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;

namespace TopIT.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultationRequestsController : ControllerBase
    {
        private readonly IConsultationRequestRepository _consultationRepo;
        private readonly IEmailService _emailService;
        private readonly IAuthRepository _authRepo;

        public ConsultationRequestsController(
            IConsultationRequestRepository consultationRepo,
            IEmailService emailService,
            IAuthRepository authRepo)
        {
            _consultationRepo = consultationRepo;
            _emailService = emailService;
            _authRepo = authRepo;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] ConsultationRequest request)
        {
            try
            {
                var newRequest = await _consultationRepo.AddAsync(request);

                // Gửi email xác nhận
                var subject = "Xác nhận yêu cầu tư vấn Nhà tuyển dụng tại TopIT";
                var body = $@"
                    <h2>Chào {newRequest.Name},</h2>
                    <p>Yêu cầu tư vấn của bạn đại diện cho <b>{newRequest.CompanyName}</b> đã được gửi thành công!</p>
                    <p>Chúng tôi sẽ nhanh chóng xem xét và phản hồi. Cảm ơn bạn đã quan tâm đến giải pháp tuyển dụng TopIT.</p>
                ";
                await _emailService.SendEmailAsync(newRequest.Email, subject, body);

                return StatusCode(201, new { message = "Yêu cầu tư vấn đã được gửi thành công!"});
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetPendingRequests()
        {
            var requests = await _consultationRepo.GetAllPendingAsync();
            return Ok(requests);
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            try
            {
                var request = await _consultationRepo.GetByIdAsync(id);
                if (request == null)
                    return NotFound(new { message = "Không tìm thấy yêu cầu tư vấn" });

                if (request.Status != "Pending")
                    return BadRequest(new { message = "Yêu cầu này đã được xử lý" });

                // Check user
                var existingUser = await _authRepo.GetUserByEmail(request.Email);
                string generatedPassword = null;

                if (existingUser != null)
                {
                    await _authRepo.UpdateUserRole(existingUser, "Employer");
                }
                else
                {
                    generatedPassword = GenerateRandomPassword();
                    var newUser = new User
                    {
                        FullName = request.Name,
                        Email = request.Email,
                        Role = "Employer"
                    };
                    await _authRepo.Register(newUser, generatedPassword);
                }

                // Update request status
                request.Status = "Approved";
                await _consultationRepo.UpdateAsync(request);

                // Send email
                var subject = "Tài khoản Nhà tuyển dụng TopIT đã sẵn sàng!";
                var body = $@"
                    <h2>Xin chào {request.Name},</h2>
                    <p>Tài khoản nhà tuyển dụng của bạn đã được kích hoạt thành công.</p>
                    <p>Truy cập vào <a href='http://localhost:4200/login'>Dashboard Nhà Tuyển Dụng</a> để bắt đầu.</p>
                ";

                if (generatedPassword != null)
                {
                    body += $@"
                    <p>Thông tin đăng nhập của bạn:</p>
                    <ul>
                        <li>Email: {request.Email}</li>
                        <li>Mật khẩu tạm thời: <b>{generatedPassword}</b></li>
                    </ul>
                    <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
                    ";
                }

                await _emailService.SendEmailAsync(request.Email, subject, body);

                return Ok(new { message = "Duyệt thành công và đã gửi email" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi duyệt", details = ex.Message });
            }
        }

        private string GenerateRandomPassword()
        {
            var chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?";
            var random = new Random();
            var result = new string(
                Enumerable.Repeat(chars, 10)
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
            return result + "A1!"; // đảm bảo có chữ hoa, số, kí tự đặc biệt (tùy cấu hình)
        }
    }
}
