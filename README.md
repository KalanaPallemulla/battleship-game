# Start all services

docker-compose up --build

## Access PgAdmin (optional)

Open http://localhost:8080
Email: admin@admin.com
Password: admin

## Prisma Migrations in Docker

### Open a shell inside the backend container:

docker exec -it battleship-backend sh

### Generate Prisma client:

npx prisma generate

### Create & apply migrations:

npx prisma migrate dev --name init

### Reset database (optional):

npx prisma migrate reset

## Running the Game

Frontend: http://localhost:5173

Backend API: http://localhost:4000

The game automatically polls for updates every 2.5 seconds.
