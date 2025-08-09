import { MongoClient } from 'mongodb';
import { loadEnv } from '../utils/load-env';
import { seedRoles, seedCounters, seedSettings } from './seeds';

// Load environment
loadEnv(process.env.NODE_ENV || 'development');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hui';

async function seedAll() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🚀 Starting database seeding...');
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Seed all data
    await seedRoles(client);
    await seedCounters(client);
    await seedSettings(client);
    
    console.log('\n🎉 All seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll().catch(console.error);
}

export { seedAll }; 