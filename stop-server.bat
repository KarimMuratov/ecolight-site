@echo off
echo Остановка сервера Node.js...
taskkill /F /IM node.exe > nul 2>&1
echo Сервер остановлен.
pause