namespace Alternativa.Api;

/// <summary>Генератор коротких строковых идентификаторов с префиксом.</summary>
public static class IdGen
{
    public static string New(string prefix) =>
        $"{prefix}-{Guid.NewGuid().ToString("N")[..8]}";
}
