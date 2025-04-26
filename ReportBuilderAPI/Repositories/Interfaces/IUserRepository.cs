using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> FindByEmailAsync(string username);
        Task<User> GetUserByEmailAsync(string Email);
        Task<User> GetUserByIdAsync(long userId);
        Task<List<User>> GetAllAsync();
        Task SaveAsync(User user);
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(long userId);
        Task<bool> EmailExistsAsync(string Email);
    }
}
