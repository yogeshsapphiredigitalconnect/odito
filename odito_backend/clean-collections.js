import { MongoClient } from "mongodb";

async function cleanCollections() {
  const client = new MongoClient("mongodb://localhost:27017/odito_dev");
  const db = client.db("odito_dev");
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    // List of collections to keep (don't delete)
    const keepCollections = ['users'];
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log("📋 Found collections:", collectionNames);
    
    // Delete all collections except users
    for (const collectionName of collectionNames) {
      if (!keepCollections.includes(collectionName)) {
        console.log(`🗑️  Deleting collection: ${collectionName}`);
        await db.collection(collectionName).drop();
      } else {
        console.log(`✅ Keeping collection: ${collectionName}`);
      }
    }
    
    console.log("\n🎉 Cleanup complete! Only 'users' collection remains.");
    
    client.close();
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

cleanCollections();
