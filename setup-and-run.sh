#!/bin/bash

# Ladda miljövariabler från .env
export $(cat .env | grep -v '^#' | xargs)

# Kör Prisma-kommandon
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Creating database tables..."
npx prisma db push

echo "🌱 Seeding test data..."
npm run seed

echo "✅ Setup complete! Starting server..."
npm run dev
