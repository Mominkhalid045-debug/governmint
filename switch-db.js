const fs = require('fs');
const path = require('path');

const target = process.argv[2];

if (target !== 'sqlite' && target !== 'postgres') {
  console.log('Usage: node switch-db.js [sqlite|postgres]');
  process.exit(1);
}

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const backupPath = path.join(__dirname, 'prisma', 'schema.postgres.prisma');

// Ensure backup of postgres schema exists
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(schemaPath, backupPath);
}

if (target === 'sqlite') {
  console.log('Switching database provider to SQLite for local development...');
  let schema = fs.readFileSync(backupPath, 'utf8');
  
  // Replace provider and URL
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url = "file:./dev.db"');
  
  // Strip PostgreSQL @db.Text attributes which SQLite doesn't support
  schema = schema.replace(/@db\.Text/g, '');
  
  fs.writeFileSync(schemaPath, schema);
  
  // Update .env database URL
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, 'utf8');
    env = env.replace(/DATABASE_URL\s*=\s*".*"/g, 'DATABASE_URL="file:./dev.db"');
    fs.writeFileSync(envPath, env);
  }
  
  console.log('Database switched to SQLite successfully!');
  console.log('Now run:');
  console.log('  1. node node_modules/prisma/build/index.js generate');
  console.log('  2. node node_modules/prisma/build/index.js db push');
  console.log('  3. npm run seed (or node node_modules/prisma/build/index.js db seed)');
} else {
  console.log('Switching database provider to PostgreSQL for production...');
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, schemaPath);
    
    // Restore .env database URL
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      let env = fs.readFileSync(envPath, 'utf8');
      env = env.replace(/DATABASE_URL\s*=\s*".*"/g, 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/governmint?schema=public"');
      fs.writeFileSync(envPath, env);
    }
    
    console.log('Database switched to PostgreSQL successfully!');
    console.log('Now run:');
    console.log('  1. node node_modules/prisma/build/index.js generate');
  } else {
    console.log('Error: Backup schema.postgres.prisma not found.');
  }
}
