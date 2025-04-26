using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Service.Interface
{
    public interface IUserService
    {
        Task<User> GetUserByIdAsync(long UserId);
        Task<User> GetUserByEmailAsync(string Email);
        Task<User?> FindByEmailAsync(string Email);
        Task<List<User>> GetAllAsync();
        Task SaveUserAsync(User User);
        Task UpdateUserAsync(User User);
        Task DeleteUserAsync(long UserId);
        Task<bool> UserExistsAsync(long UserId);
        Task<bool> EmailExistsAsync(string Email);
    }
}
