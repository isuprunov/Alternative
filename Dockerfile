# syntax=docker/dockerfile:1

# Единый образ: фронт (Vite/React) собирается и кладётся в wwwroot бэкенда,
# бэкенд (ASP.NET Core) раздаёт эту папку как статику и обслуживает /api.
# Контекст сборки — корень репозитория.

### Стадия 1: сборка фронтенда ###
FROM node:22-alpine AS frontend
WORKDIR /fe

# Сначала манифесты — для кэширования слоя с зависимостями.
COPY alternativa-online/package.json alternativa-online/package-lock.json ./
RUN npm ci

COPY alternativa-online/ ./
# Бэкенд раздаёт фронт с того же origin, поэтому API — относительный путь.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

### Стадия 2: сборка бэкенда ###
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src

COPY Alternativa.Api/Alternativa.Api.csproj Alternativa.Api/
RUN dotnet restore Alternativa.Api/Alternativa.Api.csproj

COPY Alternativa.Api/ Alternativa.Api/
# Кладём собранный фронт в wwwroot бэкенда — именно эту папку и раздаёт бэк.
COPY --from=frontend /fe/dist/ Alternativa.Api/wwwroot/

RUN dotnet publish Alternativa.Api/Alternativa.Api.csproj -c Release -o /app

### Стадия 3: рантайм ###
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=backend /app ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Alternativa.Api.dll"]
