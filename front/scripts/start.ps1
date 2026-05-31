Set-Location $PSScriptRoot\..

docker compose up --build -d

Write-Host "Ждём запуск сервисов..."
Start-Sleep -Seconds 8

Start-Process "http://localhost:8081/login"

Write-Host "Открыт http://localhost:8081/login"
Write-Host "Логи: docker compose logs -f"
Write-Host "Стоп: docker compose down"