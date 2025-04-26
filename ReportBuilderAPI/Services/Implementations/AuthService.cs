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
        public async Task<(string token, string refreshToken)> LoginAsync(string Email, string Password)
        {
            // Buscar al usuario por correo electrónico
            var user = await _userRepository.GetUserByEmailAsync(Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(Password, user.Password))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            // Depuración: Verificar la contraseña
            bool passwordMatches = BCrypt.Net.BCrypt.Verify(Password, user.Password);
            Console.WriteLine($"INFO: Usuario encontrado: {user.FullName}, Email: {user.Email}");
            Console.WriteLine($"INFO: Hash almacenado: {user.Password}");
            Console.WriteLine($"INFO: Contraseña ingresada: {Password}");
            Console.WriteLine($"INFO: ¿Coincide la contraseña?: {passwordMatches}");

            if (!passwordMatches)
            {
                Console.WriteLine("ERROR: Contraseña incorrecta");
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
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.Password))
            {
                throw new UnauthorizedAccessException("Contraseña actual incorrecta");
            }
            // Crear hash de la nueva contraseña
            string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            // Actualizar la contraseña en la base de datos
            user.Password = newPasswordHash;
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
            user.Password = newPasswordHash;
            await _userRepository.UpdateUserAsync(user);
        }
    }
}