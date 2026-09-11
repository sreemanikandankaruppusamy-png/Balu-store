import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
const DB_NAME = 'sri_balu_store';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// In-memory cache for fallback
let memoryProducts: any[] = [];
let memoryOrders: any[] = [];
let memoryAnnouncement = {
  text: 'Special Offer: Free delivery & installation in Erode on all orders above ₹10,000!',
  enabled: true,
  updatedAt: new Date().toISOString()
};

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    return { client: null, db: null };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;
    console.log('🍃 Connected to MongoDB Atlas Cloud Database');
    return { client, db };
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
    return { client: null, db: null };
  }
}

export function isMongoActive(): boolean {
  return Boolean(MONGODB_URI);
}

// ==================== PRODUCTS ====================

export async function dbGetProducts(): Promise<any[]> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      return await db.collection('products').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    } catch (err) {
      console.warn('MongoDB products fetch error:', err);
    }
  }
  return memoryProducts;
}

export async function dbSaveProduct(product: any): Promise<any> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      await db.collection('products').updateOne(
        { id: product.id },
        { $set: { ...product, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      return product;
    } catch (err) {
      console.warn('MongoDB product save error:', err);
    }
  }

  const idx = memoryProducts.findIndex(p => p.id === product.id);
  if (idx >= 0) memoryProducts[idx] = product;
  else memoryProducts.unshift(product);
  return product;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      const res = await db.collection('products').deleteOne({ id });
      return res.deletedCount > 0;
    } catch (err) {
      console.warn('MongoDB delete product error:', err);
    }
  }

  memoryProducts = memoryProducts.filter(p => p.id !== id);
  return true;
}

// ==================== ORDERS ====================

export async function dbGetOrders(): Promise<any[]> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      return await db.collection('orders').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    } catch (err) {
      console.warn('MongoDB orders fetch error:', err);
    }
  }
  return memoryOrders;
}

export async function dbSaveOrder(order: any): Promise<any> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      await db.collection('orders').insertOne({ ...order });
      return order;
    } catch (err) {
      console.warn('MongoDB save order error:', err);
    }
  }

  memoryOrders.unshift(order);
  return order;
}

export async function dbUpdateOrderStatus(id: string, status: string): Promise<any> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      await db.collection('orders').updateOne(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );
      return await db.collection('orders').findOne({ id }, { projection: { _id: 0 } });
    } catch (err) {
      console.warn('MongoDB update order status error:', err);
    }
  }

  const o = memoryOrders.find(x => x.id === id);
  if (o) o.status = status;
  return o;
}

export async function dbDeleteOrder(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      const res = await db.collection('orders').deleteOne({ id });
      return res.deletedCount > 0;
    } catch (err) {
      console.warn('MongoDB delete order error:', err);
    }
  }

  memoryOrders = memoryOrders.filter(x => x.id !== id);
  return true;
}

// ==================== ANNOUNCEMENTS / STORE MESSAGES ====================

export async function dbGetAnnouncement(): Promise<any> {
  const { db } = await connectToDatabase();
  if (db) {
    try {
      const doc = await db.collection('settings').findOne({ key: 'announcement' });
      if (doc && doc.value) return doc.value;
    } catch (e) {
      console.warn('MongoDB get announcement error:', e);
    }
  }
  return memoryAnnouncement;
}

export async function dbSetAnnouncement(announcement: any): Promise<any> {
  const payload = {
    text: announcement.text || '',
    enabled: announcement.enabled !== false,
    updatedAt: new Date().toISOString()
  };

  const { db } = await connectToDatabase();
  if (db) {
    try {
      await db.collection('settings').updateOne(
        { key: 'announcement' },
        { $set: { value: payload, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      return payload;
    } catch (e) {
      console.warn('MongoDB set announcement error:', e);
    }
  }

  memoryAnnouncement = payload;
  return payload;
}
