// Snabb-test av PostgreSQL-anslutning
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');
  
  try {
    // Test 1: Anslut till databasen
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Connected to database!\n');
    
    // Test 2: Kör en enkel query
    console.log('2️⃣ Testing query execution...');
    const result = await prisma.$queryRaw`SELECT version();`;
    console.log('   ✅ Query executed successfully!');
    console.log('   📊 PostgreSQL version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1], '\n');
    
    // Test 3: Kontrollera om SecurityAudit-tabellen finns
    console.log('3️⃣ Checking if SecurityAudit table exists...');
    try {
      const count = await prisma.securityAudit.count();
      console.log('   ✅ SecurityAudit table exists!');
      console.log('   📊 Current records:', count, '\n');
    } catch (error) {
      console.log('   ⚠️  SecurityAudit table does not exist yet');
      console.log('   💡 Run: npx prisma db push\n');
    }
    
    console.log('✅ All tests passed! Your database is ready.\n');
    console.log('📋 Next steps:');
    console.log('   1. npx prisma db push    (if table doesn\'t exist)');
    console.log('   2. npm run seed          (create test data)');
    console.log('   3. npm run dev           (start server)');
    
  } catch (error) {
    console.log('❌ Connection failed!\n');
    console.log('Error:', error.message, '\n');
    
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check if PostgreSQL is running:');
    console.log('      brew services list | grep postgresql');
    console.log('   2. Verify DATABASE_URL in .env:');
    console.log('      cat .env | grep DATABASE_URL');
    console.log('   3. Test manual connection:');
    console.log('      psql -U postgres -h localhost -d agent_memory_vault');
    console.log('   4. Create database if missing:');
    console.log('      psql postgres -c "CREATE DATABASE agent_memory_vault;"');
    console.log('\n📚 See DATABASE_SETUP.md for detailed help');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
