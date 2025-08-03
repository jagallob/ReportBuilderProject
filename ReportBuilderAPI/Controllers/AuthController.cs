using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReportBuilderAPI.Service.Interface;
using Microsoft.AspNetCore.Cors;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("auth")]
    [EnableCors("_myAllowSpecificOrigins")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet("health")]
        [EnableCors("_myAllowSpecificOrigins")]
        public IActionResult Health()
        {
            return Ok(new { message = "Auth API is running", timestamp = DateTime.UtcNow });
        }

        [HttpOptions("login")]
        public IActionResult LoginOptions()
        {
            return Ok();
        }

        [HttpPost("login")]
        [EnableCors("_myAllowSpecificOrigins")]
        public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
        {
            try
            {
                // Log the request for debugging
                Console.WriteLine($"Login attempt for email: {request.Email}");
                
                // Llamar al servicio para autenticar al usuario
                var (token, refreshToken) = await _authService.LoginAsync(request.Email, request.Password);

                // Log successful login
                Console.WriteLine($"Login successful for email: {request.Email}");

                // Devolver los tokens al frontend
                return Ok(new { token, refreshToken });
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"Login failed for email: {request.Email}, Error: {ex.Message}");
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error during login for email: {request.Email}, Error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Endpoint de prueba para verificar autenticación (sin requerir rol específico)
        /// </summary>
        [HttpGet("test-auth")]
        [Authorize]
        [EnableCors("_myAllowSpecificOrigins")]
        public ActionResult<object> TestAuth()
        {
            return Ok(new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated,
                UserName = User.Identity?.Name,
                Roles = User.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList(),
                Claims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList()
            });
        }

        public class UserLoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

    }
}

