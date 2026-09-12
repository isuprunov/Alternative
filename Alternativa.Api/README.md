# Alternativa.Api

Бэкенд сообщества «Альтернатива Онлайн» — ASP.NET Core Web API на **.NET 10**
с **PostgreSQL** (EF Core / Npgsql). Предоставляет CRUD для собраний, служений
(назначений), новостей, ресурсов и настроек.

## Запуск

1. Поднять базу (Postgres на порту **5433**) и запустить API — всё из папки
   бэкенда:

   ```bash
   cd Alternativa.Api
   docker compose up -d   # PostgreSQL на порту 5433
   dotnet run             # API на http://localhost:5080
   ```

   API слушает **http://localhost:5080**. При первом старте схема создаётся
   автоматически (`EnsureCreated`) и наполняется демо-данными.

## Эндпоинты

| Метод  | Путь                     | Назначение                       |
| ------ | ------------------------ | -------------------------------- |
| GET    | `/api/data`              | Сводный снимок (как AppData SPA) |
| GET/PUT| `/api/settings`          | Настройки сообщества             |
| CRUD   | `/api/meetings`          | Собрания (слоты расписания)      |
| CRUD   | `/api/assignments`       | Назначения служащих              |
| CRUD   | `/api/news`              | Новости                          |
| CRUD   | `/api/resources`         | Ресурсы                          |

CRUD = `GET /` (список), `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`.

OpenAPI-документ (Development): `http://localhost:5080/openapi/v1.json`.

## Конфигурация

- Строка подключения — `ConnectionStrings:Postgres` в `appsettings.json`
  (по умолчанию `Host=localhost;Port=5433;Database=alternativa;Username=alternativa;Password=alternativa`).
- CORS разрешён для Vite dev-сервера (`http://localhost:5173`).
- JSON сериализуется в camelCase — поля совпадают с типами фронтенда
  (`alternativa-online/src/types.ts`).

## Структура

```
Alternativa.Api/
  Models/Entities.cs        доменные сущности
  Data/AppDbContext.cs      EF Core контекст
  Data/DbSeeder.cs          начальное наполнение
  Controllers/              CRUD-контроллеры по сущностям + DataController
  Program.cs                конфигурация, CORS, инициализация БД
```

## Миграции (по желанию)

Сейчас схема создаётся через `EnsureCreated()`. Для перехода на миграции:

```bash
dotnet tool install --global dotnet-ef
dotnet ef migrations add Initial
dotnet ef database update
```

и заменить `EnsureCreated()` на `Migrate()` в `Program.cs`.
