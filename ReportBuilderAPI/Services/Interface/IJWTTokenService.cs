namespace ReportBuilderAPI.Service.Interface
{
    public interface IJWTTokenService
    {
        void InvalidateToken(string token);
        bool IsTokenInvalid(string token);
    }
}
