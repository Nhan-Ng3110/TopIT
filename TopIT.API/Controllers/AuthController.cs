using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TopIT.Core.DTOs;
using TopIT.Core.Entities;
using TopIT.Core.Interfaces;

namespace TopIT.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepo;
        private readonly IMapper _mapper;

        public AuthController(IAuthRepository authRepo, IMapper mapper)
        {
            _authRepo = authRepo;
            _mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            try 
            {
                if (await _authRepo.UserExists(registerDto.Email.ToLower()))
                    return BadRequest(new { message = "Email đã tồn tại trong hệ thống." });

                var userToCreate = _mapper.Map<User>(registerDto);
                userToCreate.Email = registerDto.Email.ToLower();

                var createdUser = await _authRepo.Register(userToCreate, registerDto.Password);

                return StatusCode(201, new { message = "Đăng ký thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống khi đăng ký", details = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var token = await _authRepo.Login(loginDto.Email.ToLower(), loginDto.Password);

            if (token == null)
                return Unauthorized("Invalid email or password");

            return Ok(new { token });
        }
    }
}