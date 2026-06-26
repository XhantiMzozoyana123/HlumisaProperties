FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["HlumisaProperties.Api/HlumisaProperties.Api.csproj", "HlumisaProperties.Api/"]
COPY ["HlumisaProperties.Application/HlumisaProperties.Application.csproj", "HlumisaProperties.Application/"]
COPY ["HlumisaProperties.Domain/HlumisaProperties.Domain.csproj", "HlumisaProperties.Domain/"]
COPY ["HlumisaProperties.Infrastructure/HlumisaProperties.Infrastructure.csproj", "HlumisaProperties.Infrastructure/"]
RUN dotnet restore "HlumisaProperties.Api/HlumisaProperties.Api.csproj"
COPY . .
WORKDIR "/src/HlumisaProperties.Api"
RUN dotnet build "HlumisaProperties.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HlumisaProperties.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HlumisaProperties.Api.dll"]