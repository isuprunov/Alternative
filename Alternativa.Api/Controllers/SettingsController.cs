using Alternativa.Api.Data;
using Alternativa.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<CommunitySettings> Get()
    {
        var settings = await db.Settings.FirstOrDefaultAsync();
        if (settings is null)
        {
            settings = new CommunitySettings { Id = "settings", Name = "Альтернатива Онлайн", Tagline = "" };
            db.Settings.Add(settings);
            await db.SaveChangesAsync();
        }
        return settings;
    }

    [HttpPut]
    public async Task<CommunitySettings> Update(CommunitySettings input)
    {
        var settings = await db.Settings.FirstOrDefaultAsync();
        if (settings is null)
        {
            settings = new CommunitySettings { Id = "settings" };
            db.Settings.Add(settings);
        }
        settings.Name = input.Name;
        settings.Tagline = input.Tagline;
        await db.SaveChangesAsync();
        return settings;
    }
}
