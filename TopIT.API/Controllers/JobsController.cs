using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;

namespace TopIT.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobsController : ControllerBase
    {

        public readonly IJobRepository _jobRepo;

        public JobsController(IJobRepository jobRepo)
        {
            _jobRepo = jobRepo;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? keyWord, [FromQuery] string? Location)
        {
            var result = await _jobRepo.SearchJobAsync(keyWord, Location);
            return Ok(result);

        }

        [HttpGet ("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var job = _jobRepo.GetByIDAsync(id);
            if (job == null) return NotFound("Không tìm thấy công việc này!");
            return Ok(job);
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
