import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dbPromise from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    const db = await dbPromise;
    
    // Migration dosyasının yolu
    const migrationPath = path.join(__dirname, '../../db/migrations/add_theme_and_plan_columns.sql');
    
    // Migration dosyasını oku
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // SQL komutlarını satırlara böl ve çalıştır
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await db.run(statement);
        console.log(`✅ Migration executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`⚠️  Column already exists: ${statement.substring(0, 50)}...`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations(); 