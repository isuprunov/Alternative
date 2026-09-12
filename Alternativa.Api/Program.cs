using Alternativa.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- Сервисы ---
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// PostgreSQL через EF Core (Npgsql).
var connectionString =
    builder.Configuration.GetConnectionString("Postgres")
    ?? "Host=localhost;Port=5433;Database=alternativa;Username=alternativa;Password=alternativa";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS для фронтенда: в dev разрешаем любой origin (любой порт/хост Vite).
const string corsPolicy = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(corsPolicy, policy =>
        policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();

// --- Инициализация БД: авто-миграция схемы при старте и наполнение ---
await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

// --- Конвейер ---
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(corsPolicy);

// Раздача собранного фронтенда из wwwroot (index.html как файл по умолчанию).
// В Docker-образе сюда кладётся результат сборки Vite.
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

app.MapGet("/api", () => Results.Ok(new
{
    name = "Альтернатива Онлайн — API",
    endpoints = new[]
    {
        "/api/data",
        "/api/settings",
        "/api/meetings",
        "/api/assignments",
        "/api/news",
        "/api/resources",
    },
}));

// SPA-фолбэк: любые неизвестные пути (клиентский роутинг react-router)
// отдают index.html. API- и статические запросы обрабатываются выше.
app.MapFallbackToFile("index.html");

app.Run();
