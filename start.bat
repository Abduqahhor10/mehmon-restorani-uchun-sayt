@echo off
echo ===================================================
echo     MEHMON RESTAURANT SYSTEM INITIALIZER
echo ===================================================
echo.

echo [1/3] Initializing Django Backend (Port 8000)...
start "Mehmon Backend API (8000)" cmd /k "cd backend && python manage.py migrate && python manage.py seed_data && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak >nul

echo [2/3] Initializing Client Menu Website (Port 5173)...
start "Mehmon Client Menu (5173)" cmd /k "cd client && npm install && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Initializing Admin Panel Website (Port 5174)...
start "Mehmon Admin Panel (5174)" cmd /k "cd admin && npm install && npm run dev"

echo.
echo ===================================================
echo  All services started successfully!
echo  - Client Menu Website:  http://localhost:5173
echo  - Admin Panel Portal:   http://localhost:5174
echo  - Backend REST API:     http://localhost:8000/api/
echo  - Django Admin:         http://localhost:8000/admin/
echo ===================================================
pause
