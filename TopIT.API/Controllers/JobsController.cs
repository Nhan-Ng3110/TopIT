using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TopIT.Core.DTOs;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;

namespace TopIT.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobsController : ControllerBase
    {
        public readonly IJobRepository _jobRepo;
        public readonly IApplicationRepository _appRepo;

        public JobsController(IJobRepository jobRepo, IApplicationRepository appRepo)
        {
            _jobRepo = jobRepo;
            _appRepo = appRepo;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        { 
            var jobs = await _jobRepo.GetAllAsync(); 
            return Ok(jobs);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] JobSearchDto searchDto)
        {
            var result = await _jobRepo.SearchJobAsync(searchDto);

            var authResult = await HttpContext.AuthenticateAsync(JwtBearerDefaults.AuthenticationScheme);
            if (authResult.Succeeded)
            {
                var userIdClaim = authResult.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    // Lấy danh sách ID các job mà user đã ứng tuyển
                    var userApps = await _appRepo.GetByUserIdAsync(userId);
                    var appliedJobIds = userApps.Select(a => a.JobId).ToHashSet();

                    // Lấy danh sách ID các job mà user đã lưu
                    var savedJobs = await _jobRepo.GetSavedJobsAsync(userId);
                    var savedJobIds = savedJobs.Select(s => s.JobId).ToHashSet();

                    // Map IsApplied và IsSaved cho từng job trong kết quả search
                    var searchResult = result.Select(j => new {
                        j.Id,
                        j.Title,
                        j.Description,
                        j.Location,
                        j.SalaryMin,
                        j.SalaryMax,
                        j.IsNegotiable,
                        j.Level,
                        j.JobType,
                        j.ExperienceYears,
                        j.CreatedAt,
                        j.CompanyId,
                        j.Company,
                        IsApplied = appliedJobIds.Contains(j.Id),
                        IsSaved = savedJobIds.Contains(j.Id)
                    });

                    return Ok(searchResult);
                }
            }

            return Ok(result);
        }





        [HttpGet ("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var job = await _jobRepo.GetByIDAsync(id);
            if (job == null) return NotFound("Không tìm thấy công việc này!");

            // Kiểm tra trạng thái và ghi nhận lượt xem
            bool isApplied = false;
            bool isSaved = false;
            object? existingApplicationData = null;

            var authResult = await HttpContext.AuthenticateAsync(JwtBearerDefaults.AuthenticationScheme);
            if (authResult.Succeeded)
            {
                var userIdClaim = authResult.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    // Tự động ghi nhận lượt xem (Viewed Jobs)
                    await _jobRepo.TrackViewJobAsync(userId, id);

                    // Kiểm tra ứng tuyển
                    var existingApp = await _appRepo.GetByUserAndJobAsync(userId, id);
                    if (existingApp != null)
                    {
                        isApplied = true;
                        existingApplicationData = new
                        {
                            existingApp.Id,
                            existingApp.CVPath,
                            existingApp.Message,
                            existingApp.Status,
                            existingApp.AppliedAt
                        };
                    }

                    // Kiểm tra trạng thái lưu
                    isSaved = await _jobRepo.IsJobSavedAsync(userId, id);
                }
            }

            return Ok(new
            {
                job.Id,
                job.Title,
                job.Description,
                job.Requirements,
                job.Benefits,
                job.Location,
                job.SalaryMin,
                job.SalaryMax,
                job.IsNegotiable,
                job.Level,
                job.JobType,
                job.ExperienceYears,
                job.CreatedAt,
                job.CompanyId,
                job.Company,
                IsApplied = isApplied,
                IsSaved = isSaved, // Bổ sung IsSaved
                ExistingApplication = existingApplicationData
            });
        }

        [Authorize]
        [HttpPost("toggle-save/{id}")]
        public async Task<IActionResult> ToggleSave(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Vui lòng đăng nhập để lưu công việc");

            int userId = int.Parse(userIdClaim);
            bool isSavedNow = await _jobRepo.ToggleSaveJobAsync(userId, id);

            return Ok(new { isSaved = isSavedNow, message = isSavedNow ? "Đã lưu công việc" : "Đã bỏ lưu công việc" });
        }

        [Authorize]
        [HttpGet("saved-jobs")]
        public async Task<IActionResult> GetMySavedJobs()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Vui lòng đăng nhập");

            int userId = int.Parse(userIdClaim);
            var savedJobs = await _jobRepo.GetSavedJobsAsync(userId);
            
            var result = savedJobs.Select(s => new {
                s.Id,
                s.SavedAt,
                Job = new {
                    s.Job.Id,
                    s.Job.Title,
                    s.Job.Location,
                    s.Job.SalaryMax,
                    s.Job.SalaryMin,
                    s.Job.Company
                }
            });

            return Ok(result);
        }

        [Authorize]
        [HttpGet("viewed-jobs")]
        public async Task<IActionResult> GetMyViewedJobs()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Vui lòng đăng nhập");

            int userId = int.Parse(userIdClaim);
            var viewedJobs = await _jobRepo.GetViewedJobsAsync(userId);

            var result = viewedJobs.Select(v => new {
                v.Id,
                v.ViewedAt,
                Job = new {
                    v.Job.Id,
                    v.Job.Title,
                    v.Job.Location,
                    v.Job.SalaryMax,
                    v.Job.SalaryMin,
                    v.Job.Company
                }
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Job job)
        {
            if(job.SalaryMax < job.SalaryMin)
            {
                return BadRequest("Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu");
            }    
            await _jobRepo.AddAsync(job);
            return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
        }
    }
}
