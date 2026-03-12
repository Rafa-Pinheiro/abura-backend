#!/bin/sh
set -e
echo "⏳ Aguardando banco de dados..."
npx prisma migrate deploy
echo "✅ Migrations aplicadas."
exec "$@"
