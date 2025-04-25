using DocumentFormat.OpenXml.Math;
using ReportBuilderAPI.Repositories.Interfaces;
using ReportBuilderAPI.Service.Interface;
using ReportBuilderAPI.Utils;
namespace ReportBuilderAPI.Service.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJWTUtils _jwtUtils;
        public AuthService(IUserRepository userRepository, IJWTUtils jwtUtils)
        {
            _userRepository = userRepository;
            _jwtUtils = jwtUtils;
        }
        public async Task<(string token, string refreshToken)> LoginAsync(string email, string password)
        {
            // Buscar al usuario por correo electrónico
            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }
            // Generar tokens JWT
            var token = _jwtUtils.GenerateToken(user);
            var refreshToken = _jwtUtils.GenerateRefreshToken(user);
            return (token, refreshToken);
        }
        public async Task ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            // Obtener el usuario por ID
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("Usuario no encontrado");
            }
            // Verificar que la contraseña actual sea correcta
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Contraseña actual incorrecta");
            }
            // Crear hash de la nueva contraseña
            string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            // Actualizar la contraseña en la base de datos
            user.PasswordHash = newPasswordHash;
            await _userRepository.UpdateUserAsync(user);
        }
        public async Task ChangePasswordAdminAsync(long userId, string newPassword)
        {
            // Obtener el usuario por ID
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("Usuario no encontrado");
            }
            // Crear hash de la nueva contraseña
            string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            // Actualizar la contraseña en la base de datos
            user.PasswordHash = newPasswordHash;
            await _userRepository.UpdateUserAsync(user);
        }
    }
}