using Alternativa.Api.Data;
using Alternativa.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Controllers;

[ApiController]
[Route("api/resources")]
public class ResourcesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Resource>> GetAll() =>
        await db.Resources.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Resource>> Get(string id)
    {
        var item = await db.Resources.FindAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Resource>> Create(Resource input)
    {
        if (string.IsNullOrWhiteSpace(input.Id))
            input.Id = IdGen.New("r");
        db.Resources.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Resource>> Update(string id, Resource input)
    {
        var item = await db.Resources.FindAsync(id);
        if (item is null) return NotFound();
        item.Name = input.Name;
        item.Description = input.Description;
        item.Url = input.Url;
        item.Icon = input.Icon;
        await db.SaveChangesAsync();
        return item;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await db.Resources.FindAsync(id);
        if (item is null) return NotFound();
        db.Resources.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
