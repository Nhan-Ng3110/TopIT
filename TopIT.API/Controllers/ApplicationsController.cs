using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;

namespace TopIT.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationsController : ControllerBase
    {
        public readonly IApplicationRepository _AppRepo;
        private readonly IWebHostEnvironment _env; // Dùng để lấy đường dẫn thư mục trên máy

        public ApplicationsController(IApplicationRepository appRepo, IWebHostEnvironment env)
        {
            _AppRepo = appRepo;
            _env = env;
        }
        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromForm] int jobId, [FromForm] int userId, [FromForm] string? message, IFormFile cvFile)
        {
            // 1. Kiểm tra xem có file chưa
            if (cvFile == null || cvFile.Length == 0)
                return BadRequest("Vui lòng tải lên CV của bạn!");

            // 2. Tạo thư mục lưu trữ CV (ví dụ: wwwroot/uploads/cvs)
            string uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "cvs");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            // 3. Tạo tên file duy nhất để không bị trùng (Ví dụ: user1_job5_filename.pdf)
            string uniqueFileName = $"{userId}_{jobId}_{Guid.NewGuid()}_{cvFile.FileName}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 4. Thực sự lưu file vào ổ đĩa
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await cvFile.CopyToAsync(fileStream);
            }

            // 5. Lưu thông tin vào Database
            var newApp = new JobApplication
            {
                JobId = jobId,
                UserId = userId,
                Message = message,
                CVPath = uniqueFileName, 
                AppliedAt = DateTime.Now,
                Status = "Pending"
            };

            await _AppRepo.AddAsync(newApp);

            
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            var fileUrl = $"{baseUrl}/uploads/cvs/{uniqueFileName}";

            return Ok(new
            {
                message = "Ứng tuyển thành công!",
                cvUrl = fileUrl 
            });
            
        }

        [HttpGet("job/{jobId}")]
        public async Task<IActionResult> GetApplicationsByJob(int jobId)
        {
            // 1. Gọi Repository để lấy danh sách ứng tuyển kèm thông tin User (Ứng viên)
            var applications = await _AppRepo.GetByJobIdAsync(jobId);

            // 2. Kiểm tra nếu không có ai nộp
            if (applications == null || !applications.Any())
            {
                return NotFound($"Chưa có ứng viên nào nộp đơn cho công việc có ID {jobId}");
            }

            // 3. Tạo link URL hoàn chỉnh cho mỗi cái CV để nhà tuyển dụng bấm vào là xem được luôn
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";

            var result = applications.Select(a => new {
                a.Id,
                a.JobId,
                CandidateName = a.User?.FullName, // Lấy tên từ bảng User nhờ có .Include
                a.Message,
                a.Status,
                a.AppliedAt,
                CvUrl = $"{baseUrl}/uploads/cvs/{a.CVPath}" // Link "xịn" để xem CV
            });

            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var allowedStatus = new[] { "Pending", "Interview", "Rejected", "Accepted" };
            if (!allowedStatus.Contains(dto.Status))
                return BadRequest("Trạng thái không hợp lệ!");

            var result = await _AppRepo.UpdateStatusAsync(id, dto.Status);

            if (!result)
            {
                return NotFound($"Không tìm thấy đơn ứng tuyển có ID {id}");
            }

            return Ok(new { message = $"Đã cập nhật trạng thái thành: {dto.Status}" });
        }

        public class UpdateStatusDto
        {
            public string Status { get; set; }
        }
    }

}
