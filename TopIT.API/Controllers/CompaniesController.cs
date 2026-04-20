using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TopIT.Core.Entities;
using TopIT.Infrastructure.Data;

namespace TopIT.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CompaniesController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Authorize(Roles = "Employer")]
        [HttpGet("my-company")]
        public async Task<IActionResult> GetMyCompany()
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim)) return BadRequest("Tài khoản chưa liên kết công ty.");

            int companyId = int.Parse(companyIdClaim);
            var company = await _context.Companies.FindAsync(companyId);
            
            if (company == null) return NotFound();

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            return Ok(new {
                company.Id,
                company.Name,
                company.Description,
                company.Address,
                company.Website,
                company.Size,
                LogoUrl = !string.IsNullOrEmpty(company.LogoPath) ? $"{baseUrl}/uploads/logos/{company.LogoPath}" : null,
                CoverUrl = !string.IsNullOrEmpty(company.CoverPath) ? $"{baseUrl}/uploads/covers/{company.CoverPath}" : null
            });
        }

        [Authorize(Roles = "Employer")]
        [HttpPost("upload-cover")]
        public async Task<IActionResult> UploadCover(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File không hợp lệ.");

            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim)) return Unauthorized();
            int companyId = int.Parse(companyIdClaim);

            var company = await _context.Companies.FindAsync(companyId);
            if (company == null) return NotFound();

            string uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "covers");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            string uniqueFileName = $"cover_{companyId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            company.CoverPath = uniqueFileName;
            await _context.SaveChangesAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            return Ok(new { coverUrl = $"{baseUrl}/uploads/covers/{uniqueFileName}" });
        }

        [Authorize(Roles = "Employer")]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateCompany([FromBody] Company updateDto)
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim)) return Unauthorized();
            int companyId = int.Parse(companyIdClaim);

            var company = await _context.Companies.FindAsync(companyId);
            if (company == null) return NotFound();

            company.Name = updateDto.Name;
            company.Description = updateDto.Description;
            company.Address = updateDto.Address;
            company.Website = updateDto.Website;
            company.Size = updateDto.Size;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin công ty thành công" });
        }
    }
}
