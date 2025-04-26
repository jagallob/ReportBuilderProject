using ReportBuilderAPI.Models;
using ReportBuilderAPI.Repositories.Interfaces;
using ReportBuilderAPI.Service.Interface;

namespace ReportBuilderAPI.Service.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User> GetUserByIdAsync(long UserId)
        {
            return await _userRepository.GetUserByIdAsync(UserId);
        }

        public async Task<User> GetUserByEmailAsync(string Email)
        {
            return await _userRepository.GetUserByEmailAsync(Email);
        }

        public async Task<User?> FindByEmailAsync(string Email)
        {
            return await _userRepository.FindByEmailAsync(Email);
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task SaveUserAsync(User User)
        {
            await _userRepository.SaveAsync(User);
        }

        public async Task UpdateUserAsync(User User)
        {
            await _userRepository.UpdateUserAsync(User);
        }

        public async Task DeleteUserAsync(long UserId)
        {
            await _userRepository.DeleteUserAsync(UserId);
        }

        public async Task<bool> UserExistsAsync(long UserId)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(UserId);
                return user != null;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
        }

        public async Task<bool> EmailExistsAsync(string Email)
        {
            return await _userRepository.EmailExistsAsync(Email);
        }
    }
}
