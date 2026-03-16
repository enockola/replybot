import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupDatabase = async () => {
  let hasData = false;

  try {
    const result = await db.query(
      'SELECT EXISTS (SELECT 1 FROM roles LIMIT 1) AS has_data'
    );
    hasData = result.rows[0]?.has_data || false;
  } catch (error) {
    hasData = false;
  }

  // Create tables first
  const schemaPath = join(__dirname, 'sql', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await db.query(schemaSQL);
    console.log('ReplyBot schema initialized');
  }

  // If already seeded, stop here
  if (hasData) {
    console.log('Database already seeded');
    return true;
  }

  // Seed initial data
  console.log('Seeding database...');
  const seedPath = join(__dirname, 'sql', 'seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf8');
  await db.query(seedSQL);
  console.log('Database seeded successfully');

  return true;
};

const testConnection = async () => {
  const result = await db.query('SELECT NOW() AS current_time');
  console.log('Database connection successful:', result.rows[0].current_time);
  return true;
};

export { setupDatabase, testConnection };