using Alternativa.Api.Data;
using Alternativa.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Controllers;

[ApiController]
[Route("api/meetings")]
public class MeetingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Meeting>> GetAll() =>
        await db.Meetings.OrderBy(m => m.StartTime).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Meeting>> Get(string id)
    {
        var item = await db.Meetings.FindAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Meeting>> Create(Meeting input)
    {
        if (string.IsNullOrWhiteSpace(input.Id))
            input.Id = IdGen.New("m");
        db.Meetings.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Meeting>> Update(string id, Meeting input)
    {
        var item = await db.Meetings.FindAsync(id);
        if (item is null) return NotFound();
        item.Title = input.Title;
        item.StartTime = input.StartTime;
        item.EndTime = input.EndTime;
        item.JoinUrl = input.JoinUrl;
        item.Note = input.Note;
        await db.SaveChangesAsync();
        return item;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await db.Meetings.FindAsync(id);
        if (item is null) return NotFound();
        db.Meetings.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
