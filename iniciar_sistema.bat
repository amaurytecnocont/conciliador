@echo off
title ConciliaERP - Inicializador
echo ============================================================
echo           INICIALIZADOR DO CONCILIA ERP
echo ============================================================
echo.

:: Verificar se Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit
)

echo [1/3] Instalando dependencias...
call npm install

echo [2/3] Construindo o sistema...
call npm run build

echo [3/3] Iniciando o servidor...
echo O sistema estara disponivel em http://localhost:3000
start http://localhost:3000
call npm start

pause
