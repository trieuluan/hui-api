import { MongoClient } from 'mongodb';
import { loadEnv } from '../utils/load-env';
import { seedRoles, seedCounters, seedSettings } from './seeds';

// Load environment
loadEnv(process.env.NODE_ENV || 'development');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hui';

async function checkAndSeed() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔍 Checking database state...');
    
    await client.connect();
    const db = client.db();
    
    // Check if roles exist
    const rolesCount = await db.collection('roles').countDocuments();
    const countersCount = await db.collection('counters').countDocuments();
    const settingsCount = await db.collection('settings').countDocuments();
    
    console.log(`📊 Current database state:`);
    console.log(`  - Roles: ${rolesCount}`);
    console.log(`  - Counters: ${countersCount}`);
    console.log(`  - Settings: ${settingsCount}`);
    
    // Check if seeding is needed
    const needsSeeding = rolesCount === 0 || countersCount === 0 || settingsCount === 0;
    
    if (needsSeeding) {
      console.log('\n🌱 Database needs seeding. Starting...');
      await client.close();
      
      // Reconnect and seed
      const seedClient = new MongoClient(MONGODB_URI);
      await seedClient.connect();
      
      if (rolesCount === 0) await seedRoles(seedClient);
      if (countersCount === 0) await seedCounters(seedClient);
      if (settingsCount === 0) await seedSettings(seedClient);
      
      await seedClient.close();
    } else {
      console.log('\n✅ Database is already seeded. No action needed.');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAndSeed().catch(console.error);
}

export { checkAndSeed }; 