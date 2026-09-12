using Alternativa.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<ServiceAssignment> Assignments => Set<ServiceAssignment>();
    public DbSet<NewsItem> News => Set<NewsItem>();
    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<CommunitySettings> Settings => Set<CommunitySettings>();
}
