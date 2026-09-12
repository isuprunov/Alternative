using Alternativa.Api.Data;
using Alternativa.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Controllers;

[ApiController]
[Route("api/assignments")]
public class AssignmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<ServiceAssignment>> GetAll() =>
        await db.Assignments.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceAssignment>> Get(string id)
    {
        var item = await db.Assignments.FindAsync(id);
        return item is null ? NotFound() : item;
    }

    /// <summary>
    /// Есть ли конфликтующее назначение той же роли того же собрания:
    /// повторно «постоянно» либо разово на ту же дату (исключая запись exceptId).
    /// </summary>
    private async Task<bool> HasConflictAsync(ServiceAssignment input, string? exceptId)
    {
        var query = db.Assignments.Where(a =>
            a.Id != exceptId &&
            a.MeetingId == input.MeetingId &&
            a.Role == input.Role);

        query = input.Scope == "permanent"
            ? query.Where(a => a.Scope == "permanent")
            : query.Where(a => a.Scope == "once" && a.Date == input.Date);

        return await query.AnyAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ServiceAssignment>> Create(ServiceAssignment input)
    {
        if (string.IsNullOrWhiteSpace(input.Id))
            input.Id = IdGen.New("a");
        if (input.Scope == "permanent")
            input.Date = null;
        if (await HasConflictAsync(input, null))
            return Conflict(new { message = "Роль на этом собрании уже назначена (постоянно или на эту дату)." });
        db.Assignments.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceAssignment>> Update(string id, ServiceAssignment input)
    {
        var item = await db.Assignments.FindAsync(id);
        if (item is null) return NotFound();
        if (await HasConflictAsync(input, id))
            return Conflict(new { message = "Роль на этом собрании уже назначена (постоянно или на эту дату)." });
        item.MeetingId = input.MeetingId;
        item.Role = input.Role;
        item.Scope = input.Scope;
        item.Date = input.Scope == "permanent" ? null : input.Date;
        item.AssigneeName = input.AssigneeName;
        item.AssigneeTelegram = input.AssigneeTelegram;
        await db.SaveChangesAsync();
        return item;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await db.Assignments.FindAsync(id);
        if (item is null) return NotFound();
        db.Assignments.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
