using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Utils
{
    public class JWTUtils : IJWTUtils
    {
        private readonly SymmetricSecurityKey _key;
        private const long ACCESS_TOKEN_EXPIRATION = 3600000; // 1 hora
        private const long REFRESH_TOKEN_EXPIRATION = 604800000; // 7 días

        public JWTUtils()
        {
            var secretString = "SuperClaveUltraSecretaParaReportes123456789R$T%U!";
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretString));
        }

        public string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email.Trim()),
                new Claim("name", user.FullName ?? ""), // Agregando el claim "name" para el frontend
                new Claim("role", user.Role),
                new Claim("id", user.Id.ToString()),
                new Claim("areaId", user.AreaId?.ToString() ?? "")
            };
            return CreateToken(claims, ACCESS_TOKEN_EXPIRATION);
        }

        public string GenerateRefreshToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email.Trim()),
                new Claim("id", user.Id.ToString())
            };
            return CreateToken(claims, REFRESH_TOKEN_EXPIRATION);
        }

        private string CreateToken(IEnumerable<Claim> claims, long expiration)
        {
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMilliseconds(expiration),
                Issuer = "ReportBuilderAPI",
                Audience = "ReportBuilderClient",
                SigningCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public ClaimsPrincipal ExtractClaims(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }

        public bool IsTokenValid(string token, User user)
        {
            try
            {
                var principal = ExtractClaims(token);
                var username = principal.Identity?.Name;
                var userId = principal.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                return username == user.Email && userId == user.Id.ToString();
            }
            catch
            {
                return false;
            }
        }
    }
}