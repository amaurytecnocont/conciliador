@echo off
setlocal enabledelayedexpansion
title ConciliaERP - Instalador Completo
echo ============================================================
echo           INSTALADOR AUTOMATICO - CONCILIA ERP
echo ============================================================
echo.

:: 1. Verificar se Node.js esta instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] Node.js nao encontrado. Tentando instalar via winget...
    
    :: Tentar usar winget (Windows 10/11)
    winget --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [INFO] Instalando Node.js (LTS) via winget...
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        if !errorlevel! neq 0 (
            echo [ERRO] Falha ao instalar Node.js via winget.
            echo Por favor, instale manualmente em: https://nodejs.org/
            pause
            exit /b
        )
        echo [SUCESSO] Node.js instalado. Reinicie este script para continuar.
        pause
        exit /b
    ) else (
        echo [ERRO] winget nao encontrado. 
        echo Por favor, instale o Node.js manualmente em: https://nodejs.org/
        pause
        exit /b
    )
) else (
    echo [OK] Node.js ja esta instalado.
)

echo.
echo [2/4] Instalando dependencias do sistema (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias. Verifique sua conexao.
    pause
    exit /b
)

echo.
echo [3/4] Gerando arquivos de producao (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar o sistema.
    pause
    exit /b
)

echo.
echo [4/4] Iniciando o sistema...
echo O sistema estara disponivel em http://localhost:3000
start http://localhost:3000
call npm start

pause
