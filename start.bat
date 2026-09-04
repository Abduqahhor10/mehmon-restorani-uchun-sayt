@echo off
REM Mehmon Restaurant - local development launcher (backend + client + admin).
setlocal
set ROOT=%~dp0

echo ===================================================
echo     MEHMON RESTAURANT - LOCAL DEV
echo ===================================================

cd /d "%ROOT%backend"

if not exist venv (
    echo Creating Python virtualenv...
    python -m venv venv
)
call venv\Scripts\pip.exe install -q --upgrade pip
call venv\Scripts\pip.exe install -q -r requirements.txt

REM DEBUG=True keeps local runs on SQLite with permissive CORS.
set DEBUG=True

call venv\Scripts\python.exe manage.py migrate --noinput
call venv\Scripts\python.exe manage.py seed_data
call venv\Scripts\python.exe manage.py create_admin

start "Mehmon API" cmd /k "cd /d %ROOT%backend && set DEBUG=True && venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

cd /d "%ROOT%client"
if not exist node_modules call npm install
start "Mehmon Client" cmd /k "cd /d %ROOT%client && npm run dev"

cd /d "%ROOT%admin"
if not exist node_modules call npm install
start "Mehmon Admin" cmd /k "cd /d %ROOT%admin && npm run dev"

echo.
echo All services running:
echo - Client: http://localhost:5173
echo - Admin:  http://localhost:5174
echo - API:    http://localhost:8000/api/
echo.
pause
