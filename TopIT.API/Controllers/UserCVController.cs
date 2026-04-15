using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;

namespace TopIT.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserCVController : ControllerBase
    {
        private readonly IUserCVRepository _cvRepo;
        private readonly IWebHostEnvironment _env;

        public UserCVController(IUserCVRepository cvRepo, IWebHostEnvironment env)
        {
            _cvRepo = cvRepo;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserCVs()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            
            var userId = int.Parse(userIdClaim);
            var cvs = await _cvRepo.GetByUserIdAsync(userId);

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            var result = cvs.Select(x => new
            {
                x.Id,
                x.FileName,
                x.IsDefault,
                x.UploadDate,
                FileUrl = $"{baseUrl}/uploads/cvs/{x.FileUrl}"
            });

            return Ok(result);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCV(IFormFile file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var userId = int.Parse(userIdClaim);

            // Giới hạn 5 CV
            var count = await _cvRepo.GetCountByUserIdAsync(userId);
            if (count >= 5)
                return BadRequest(new { message = "Bạn chỉ được phép lưu tối đa 5 bản CV. Vui lòng xóa bớt bản cũ." });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file CV." });

            // Validate extension
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Chỉ chấp nhận file .pdf, .doc, .docx" });

            // Validate size (< 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Dung lượng file không được vượt quá 5MB." });

            string uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "cvs");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            string uniqueFileName = $"{userId}_{Guid.NewGuid()}{extension}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            var userCV = new UserCV
            {
                UserId = userId,
                FileName = file.FileName,
                FileUrl = uniqueFileName,
                UploadDate = DateTime.Now,
                IsDefault = false 
            };

            await _cvRepo.AddAsync(userCV);

            return Ok(new { message = "Tải lên CV thành công!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCV(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var userId = int.Parse(userIdClaim);
            var cv = await _cvRepo.GetByIdAsync(id);

            if (cv == null || cv.UserId != userId)
                return NotFound(new { message = "Không tìm thấy CV." });

            // Xóa file vật lý
            string filePath = Path.Combine(_env.ContentRootPath, "uploads", "cvs", cv.FileUrl);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            await _cvRepo.DeleteAsync(id);
            return Ok(new { message = "Đã xóa CV thành công." });
        }

        [HttpPut("{id}/set-default")]
        public async Task<IActionResult> SetDefault(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var userId = int.Parse(userIdClaim);
            var result = await _cvRepo.SetDefaultAsync(userId, id);

            if (!result) return BadRequest(new { message = "Không thể đặt làm CV chính." });

            return Ok(new { message = "Đã thay đổi CV chính thành công." });
        }
    }
}
