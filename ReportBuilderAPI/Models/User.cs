﻿namespace ReportBuilderAPI.Models
{
    public class User
    {
        public int? Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; } 
        public string? Role { get; set; } // Ej: "Admin", "Manager", "User"
        public int? AreaId { get; set; }
        public Area? Area { get; set; }
    }
}