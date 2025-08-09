import { MongoClient } from 'mongodb';

export async function seedCounters(client: MongoClient) {
  const db = client.db();
  const countersCollection = db.collection('counters');
  
  console.log('🌱 Seeding counters...');
  
  await countersCollection.updateOne(
    { _id: 'groupCode' as any },
    { $setOnInsert: { seq: 0 } },
    { upsert: true }
  );
  
  console.log('✅ Counter "groupCode" initialized');
} 