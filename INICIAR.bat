@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Portal Unificado
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  No se encontro Node.js.
  echo  Instala Node desde https://nodejs.org ^(cualquier version reciente^)
  echo  Luego vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

call node scripts\run.mjs install
if errorlevel 1 (
  echo.
  echo  Fallo la instalacion.
  pause
  exit /b 1
)

call node scripts\run.mjs start
exit /b %ERRORLEVEL%
