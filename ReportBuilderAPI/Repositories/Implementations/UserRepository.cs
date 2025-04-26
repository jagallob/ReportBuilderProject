using ReportBuilderAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Data;
using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetUserByEmailAsync(string Email)
        {
            return await _context.Users
                .Include(u => u.Area)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == Email)
                ?? throw new InvalidOperationException("User not found");
        }
        public async Task<User?> FindByEmailAsync(string Email)
        {
            return await _context.Users
                .Include(u => u.Area)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => EF.Functions.Like(u.Email, Email));
        }
        public async Task<User> GetUserByIdAsync(long userId)
        {
            return await _context.Users
                .Include(u => u.Area)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new InvalidOperationException("User not found");
        }
        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.AsNoTracking().ToListAsync();
        }


        public async Task SaveAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }


        public async Task UpdateUserAsync(User user)
        {
            var existingUser = await _context.Users.FindAsync(user.Id);

            if (existingUser == null)
            {
                throw new InvalidOperationException("User not found");
            }

            existingUser.Email = user.Email;
            existingUser.FullName = user.FullName;
            existingUser.Role = user.Role;
          
            _context.Entry(existingUser).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(long userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> EmailExistsAsync(string Email)
        {
            return await _context.Users.AnyAsync(u => u.Email == Email);
        }

    }
}
