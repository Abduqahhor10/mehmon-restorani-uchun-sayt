#!/bin/bash
echo "==================================================="
echo "    MEHMON RESTAURANT SYSTEM INITIALIZER"
echo "==================================================="

# Start Backend
cd backend
python manage.py migrate
python manage.py seed_data
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Start Client
cd client
npm install
npm run dev &
CLIENT_PID=$!
cd ..

# Start Admin
cd admin
npm install
npm run dev &
ADMIN_PID=$!
cd ..

echo "All services running:"
echo "- Client: http://localhost:5173"
echo "- Admin:  http://localhost:5174"
echo "- API:    http://localhost:8000/api/"

wait $BACKEND_PID $CLIENT_PID $ADMIN_PID
