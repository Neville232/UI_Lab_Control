@echo off
echo Stopping any running instances of the server...
taskkill /F /IM node.exe

echo Starting the server...
cd /d "C:\Users\Nelvinson\Documents\1- UNIVERSIDAD\8 - LABORATORIO DE CONTROL\VS Code\UI Control NodeJS\"
start cmd /k "node server.js"

echo Server restarted successfully.
pause