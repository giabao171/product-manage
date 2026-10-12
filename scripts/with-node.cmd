@echo off
call nvm use 22
if errorlevel 1 exit /b 1
ping -n 2 127.0.0.1 >nul
set "PATH=%NVM_SYMLINK%;%PATH%"
%*
