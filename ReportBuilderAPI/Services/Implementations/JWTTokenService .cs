using System.Collections.Concurrent;
using ReportBuilderAPI.Service.Interface;

namespace ReportBuilderAPI.Service.Implementations
{
    public class JWTTokenService : IJWTTokenService
    {
        private readonly ConcurrentDictionary<string, bool> _invalidTokens = new();

        public void InvalidateToken(string token)
        {
            _invalidTokens.TryAdd(token, true);
        }

        public bool IsTokenInvalid(string token)
        {
            return _invalidTokens.ContainsKey(token);
        }
    }
}
