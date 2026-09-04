#!/usr/bin/env bash
# Mehmon Restaurant — local development launcher (backend + client + admin).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==================================================="
echo "    MEHMON RESTAURANT — LOCAL DEV"
echo "==================================================="

# ---------- Backend ----------
cd "$ROOT/backend"

if [ ! -d venv ]; then
  echo "→ Creating Python virtualenv..."
  python3 -m venv venv
fi
./venv/bin/pip install -q --upgrade pip
./venv/bin/pip install -q -r requirements.txt

# DEBUG=True keeps local runs on SQLite with permissive CORS.
export DEBUG=True

./venv/bin/python manage.py migrate --noinput
./venv/bin/python manage.py seed_data

# Creates the 'admin' staff account on first run and prints its password.
./venv/bin/python manage.py create_admin

./venv/bin/python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# ---------- Frontends ----------
cd "$ROOT/client"
[ -d node_modules ] || npm install
npm run dev &
CLIENT_PID=$!

cd "$ROOT/admin"
[ -d node_modules ] || npm install
npm run dev &
ADMIN_PID=$!

cleanup() {
  echo ""
  echo "Stopping services..."
  kill "$BACKEND_PID" "$CLIENT_PID" "$ADMIN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "All services running:"
echo "- Client: http://localhost:5173"
echo "- Admin:  http://localhost:5174"
echo "- API:    http://localhost:8000/api/"
echo ""
echo "Press Ctrl+C to stop."

wait
