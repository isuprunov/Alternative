using Alternativa.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Alternativa.Api.Data;

/// <summary>Наполнение базы начальными данными при первом запуске.</summary>
public static class DbSeeder
{
    private static string DayFromNow(int offset) =>
        DateTime.Today.AddDays(offset).ToString("yyyy-MM-dd");

    private static string Hhmm(int minutes)
    {
        var m = ((minutes % 1440) + 1440) % 1440;
        return $"{m / 60:D2}:{m % 60:D2}";
    }

    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Settings.AnyAsync() || await db.Meetings.AnyAsync())
            return; // уже наполнено

        db.Settings.Add(new CommunitySettings
        {
            Id = "settings",
            Name = "Альтернатива Онлайн",
            Tagline = "Единое информационное пространство сообщества. Собрания, служения, новости и ресурсы — в одном месте.",
        });

        // Собрания: каждый нечётный час в :30, длительностью 1,5 часа.
        const int durationMin = 90;
        for (var hour = 1; hour <= 23; hour += 2)
        {
            var startMin = hour * 60 + 30;
            db.Meetings.Add(new Meeting
            {
                Id = $"m-{hour:D2}30",
                Title = "Собрание группы",
                StartTime = Hhmm(startMin),
                EndTime = Hhmm(startMin + durationMin),
                JoinUrl = "https://zoom.us/j/0000000000",
            });
        }

        db.Assignments.AddRange(
            new ServiceAssignment { Id = "a-1", MeetingId = "m-1930", Role = "соорг", Scope = "permanent", AssigneeName = "Мария", AssigneeTelegram = "@maria" },
            new ServiceAssignment { Id = "a-2", MeetingId = "m-1930", Role = "ведущий", Scope = "once", Date = DayFromNow(0), AssigneeName = "Иван", AssigneeTelegram = "@ivan" },
            new ServiceAssignment { Id = "a-3", MeetingId = "m-1130", Role = "чайханщик", Scope = "permanent", AssigneeName = "Пётр", AssigneeTelegram = "@petr" },
            new ServiceAssignment { Id = "a-4", MeetingId = "m-1930", Role = "соорг", Scope = "once", Date = DayFromNow(1), AssigneeName = "Анна", AssigneeTelegram = "@anna" },
            new ServiceAssignment { Id = "a-5", MeetingId = "m-1930", Role = "соорг", Scope = "once", Date = DayFromNow(3), AssigneeName = "Олег", AssigneeTelegram = "@oleg" }
        );

        db.News.AddRange(
            new NewsItem
            {
                Id = "n-1",
                Date = DayFromNow(-1),
                Title = "Изменение во времени пятничного собрания",
                Excerpt = "С этой недели вечернее собрание начинается в 20:00.",
                Body = "Дорогие друзья!\n\nОбращаем внимание на изменение времени. Ссылка для подключения остаётся прежней.",
                Pinned = true,
                Important = true,
            },
            new NewsItem
            {
                Id = "n-2",
                Date = DayFromNow(-3),
                Title = "Нужны служащие на выходные",
                Excerpt = "Открыт набор служащих на собрания субботы и воскресенья.",
                Body = "На собрания предстоящих выходных открыты позиции. Если готовы послужить — свяжитесь с администратором.",
                Pinned = false,
                Important = false,
            },
            new NewsItem
            {
                Id = "n-3",
                Date = DayFromNow(-6),
                Title = "Обновлён список ресурсов сообщества",
                Excerpt = "Добавлены ссылки на новый информационный канал и рабочие чаты.",
                Body = "Мы обновили раздел «Наши ресурсы». Загляните, чтобы быть в курсе.",
                Pinned = false,
                Important = false,
            }
        );

        db.Resources.AddRange(
            new Resource { Id = "r-1", Name = "Telegram-канал", Description = "Основные объявления и новости сообщества.", Url = "https://t.me/alternativa_channel", Icon = "telegram" },
            new Resource { Id = "r-2", Name = "Telegram-бот", Description = "Запись на служения и обратная связь.", Url = "https://t.me/alternativa_bot", Icon = "bot" },
            new Resource { Id = "r-3", Name = "Информационный канал", Description = "Материалы, расписания и полезная информация.", Url = "https://t.me/alternativa_info", Icon = "channel" },
            new Resource { Id = "r-4", Name = "Рабочие чаты", Description = "Общение и координация между служащими.", Url = "https://t.me/alternativa_chats", Icon = "chat" },
            new Resource { Id = "r-5", Name = "Zoom", Description = "Платформа для проведения онлайн-собраний.", Url = "https://zoom.us", Icon = "video" }
        );

        await db.SaveChangesAsync();
    }
}
