using Alternativa.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Controllers;

/// <summary>
/// Сводный снимок всех данных в форме, удобной для SPA
/// (соответствует AppData на фронтенде).
/// </summary>
[ApiController]
[Route("api/data")]
public class DataController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<object> Get() => new
    {
        settings = await db.Settings.FirstOrDefaultAsync(),
        meetings = await db.Meetings.OrderBy(m => m.StartTime).ToListAsync(),
        assignments = await db.Assignments.ToListAsync(),
        news = await db.News.OrderByDescending(n => n.Date).ToListAsync(),
        resources = await db.Resources.ToListAsync(),
    };
}
