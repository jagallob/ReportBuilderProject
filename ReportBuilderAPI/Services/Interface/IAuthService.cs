namespace ReportBuilderAPI.Service.Interface
{
    public interface IAuthService
    {
        Task<(string token, string refreshToken)> LoginAsync(string Email, string Password);
        Task ChangePasswordAsync(int UserId, string CurrentPassword, string NewPassword);
        Task ChangePasswordAdminAsync(long UserId, string NewPassword);
    }
}
