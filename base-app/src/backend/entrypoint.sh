#!/bin/bash
set -e
echo "🚀 Starting Digimart Entry Point..."
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
if [[ "$DATABASE_URL" != *"sqlite"* ]]; then
    echo "⏳ Waiting for database at $DB_HOST:$DB_PORT..."
    max_attempts=30
    attempt=0
    until nc -z "$DB_HOST" "$DB_PORT" || [ $attempt -eq $max_attempts ]; do
        attempt=$((attempt+1))
        echo "Database unavailable (attempt $attempt/$max_attempts). Sleeping 2s..."
        sleep 2
    done
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Database connection failed after $max_attempts attempts."
        exit 1
    fi
    echo "✅ Database is ready!"
else
    echo "💾 Detected SQLite. Skipping network wait."
fi
echo "🔄 Applying migrations..."
python manage.py migrate --noinput
if [ "$SEED_MODE" = "private" ]; then
    echo "🌱 Seeding PRIVATE data..."
    if [ -f "evaluation/scripts/seed_private.py" ]; then
        python evaluation/scripts/seed_private.py
    elif [ -f "../evaluation/scripts/seed_private.py" ]; then
        python ../evaluation/scripts/seed_private.py
    else
        echo "⚠️ Private seed script not found."
    fi
elif [ "$SEED_DATA" = "True" ]; then
    echo "🌱 Seeding PUBLIC data..."
    python seed_public.py || echo "⚠️ Public seed failed or skipped."
fi
echo "▶️ Starting server..."
exec python manage.py runserver 0.0.0.0:3000