namespace ReportBuilderAPI.Models
{
    public class User
    {
        public int? Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }  // Añadida propiedad para almacenar el hash de la contraseña
        public string? Role { get; set; } // Ej: "Admin", "Manager", "User"
        public int? AreaId { get; set; }
        public Area? Area { get; set; }
    }
}