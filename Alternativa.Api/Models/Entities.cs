using System.ComponentModel.DataAnnotations;

namespace Alternativa.Api.Models;

/// <summary>
/// Собрание в расписании. Расписание ежедневное: собрание повторяется каждый
/// день в указанное время.
/// </summary>
public class Meeting
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    /// <summary>Время начала в формате "HH:MM".</summary>
    public string StartTime { get; set; } = string.Empty;

    /// <summary>Время окончания в формате "HH:MM" (может переходить за полночь).</summary>
    public string EndTime { get; set; } = string.Empty;

    /// <summary>Ссылка для подключения.</summary>
    public string JoinUrl { get; set; } = string.Empty;

    public string? Note { get; set; }
}

/// <summary>
/// Назначение служащего на роль конкретного собрания (слота).
/// scope = "permanent" — закреплён каждый день; "once" — только на дату Date.
/// </summary>
public class ServiceAssignment
{
    [Key]
    public string Id { get; set; } = string.Empty;

    /// <summary>Ссылка на собрание-слот (Meeting.Id).</summary>
    public string MeetingId { get; set; } = string.Empty;

    /// <summary>Роль: "соорг" | "ведущий" | "чайханщик".</summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>"once" | "permanent".</summary>
    public string Scope { get; set; } = "once";

    /// <summary>Дата "YYYY-MM-DD" — для scope = "once".</summary>
    public string? Date { get; set; }

    public string AssigneeName { get; set; } = string.Empty;

    /// <summary>Telegram-ник, например "@ivan".</summary>
    public string AssigneeTelegram { get; set; } = string.Empty;
}

/// <summary>Новость / объявление.</summary>
public class NewsItem
{
    [Key]
    public string Id { get; set; } = string.Empty;

    /// <summary>Дата публикации "YYYY-MM-DD".</summary>
    public string Date { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    /// <summary>Закреплено вверху раздела.</summary>
    public bool Pinned { get; set; }

    /// <summary>Особо важное объявление.</summary>
    public bool Important { get; set; }
}

/// <summary>Внешний ресурс сообщества.</summary>
public class Resource
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;

    /// <summary>Ключ иконки: telegram | bot | channel | chat | video | link.</summary>
    public string Icon { get; set; } = "link";
}

/// <summary>Общие настройки сообщества (единственная запись, Id = "settings").</summary>
public class CommunitySettings
{
    [Key]
    public string Id { get; set; } = "settings";

    public string Name { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
}
