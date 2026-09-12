using Alternativa.Api.Data;
using Alternativa.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<NewsItem>> GetAll() =>
        await db.News.OrderByDescending(n => n.Date).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<NewsItem>> Get(string id)
    {
        var item = await db.News.FindAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<NewsItem>> Create(NewsItem input)
    {
        if (string.IsNullOrWhiteSpace(input.Id))
            input.Id = IdGen.New("n");
        db.News.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<NewsItem>> Update(string id, NewsItem input)
    {
        var item = await db.News.FindAsync(id);
        if (item is null) return NotFound();
        item.Date = input.Date;
        item.Title = input.Title;
        item.Excerpt = input.Excerpt;
        item.Body = input.Body;
        item.ImageUrl = input.ImageUrl;
        item.Pinned = input.Pinned;
        item.Important = input.Important;
        await db.SaveChangesAsync();
        return item;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await db.News.FindAsync(id);
        if (item is null) return NotFound();
        db.News.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
