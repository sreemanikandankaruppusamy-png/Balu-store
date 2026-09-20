import { MongoClient, Db } from 'mongodb';

const rawUri = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
const MONGODB_URI = (!rawUri || rawUri.includes('<username>') || rawUri.includes('<password>') || rawUri.includes('xxxxx')) ? '' : rawUri;
const DB_NAME = 'sri_balu_store';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const INITIAL_PRODUCTS = [
  {
    id: 'id_demo_tv_01',
    name: 'Samsung 43" Crystal 4K Smart TV',
    brand: 'Samsung',
    category: 'electronics',
    price: 28990,
    discount: 15,
    description: 'Ultra HD 4K LED Smart TV with HDR10+, Dolby Audio, voice remote and built-in streaming apps.',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    published: true,
    colors: [{ id: 'c1', name: 'Gloss Black', hex: '#1B2A4A' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'id_demo_table_02',
    name: 'Solid Sheesham Wood 6-Seater Dining Table',
    brand: 'WoodCraft',
    category: 'furniture',
    price: 21500,
    discount: 10,
    description: 'Handcrafted premium Sheesham wood dining table set with 6 comfortable cushioned chairs in walnut finish.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80',
    published: true,
    colors: [
      { id: 'c2', name: 'Walnut Dark', hex: '#6B4226' },
      { id: 'c3', name: 'Natural Honey', hex: '#C9A86A' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'id_demo_speaker_03',
    name: 'JBL Charge 5 Portable Bluetooth Speaker',
    brand: 'JBL',
    category: 'electronics',
    price: 14999,
    discount: 12,
    description: 'Waterproof IP67 portable speaker with 20 hours playtime, powerbank feature, and signature deep bass.',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    published: true,
    colors: [
      { id: 'c4', name: 'Fiery Red', hex: '#B54747' },
      { id: 'c5', name: 'Midnight Black', hex: '#1B2A4A' },
      { id: 'c6', name: 'Ocean Blue', hex: '#3B5BA5' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'id_demo_sofa_04',
    name: 'Luxury 3-Seater Fabric Recliner Sofa',
    brand: 'Urban Living',
    category: 'furniture',
    price: 34999,
    discount: 8,
    description: 'Ergonomic high-density foam recliner sofa with breathable velvet fabric and sturdy hardwood frame.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    published: true,
    colors: [
      { id: 'c7', name: 'Slate Grey', hex: '#4A5568' },
      { id: 'c8', name: 'Warm Cream', hex: '#E2D9C9' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'id_demo_purifier_05',
    name: 'Kaviya 10-Stage RO+UV+Alkaline Water Purifier',
    brand: 'Kaviya',
    category: 'rowater',
    price: 11499,
    discount: 18,
    description: 'Advanced 10-stage RO+UV+UF+TDS control with 10L food-grade storage and active copper alkaline boost.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80',
    published: true,
    colors: [
      { id: 'c9', name: 'Arctic White', hex: '#FFFFFF' },
      { id: 'c10', name: 'Piano Black', hex: '#1B2A4A' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ord_demo_101',
    type: 'order',
    customerName: 'Karthik Raja',
    phone: '+91 98765 43210',
    address: '14/B Gandhi Road, Erode, Tamil Nadu - 638001',
    notes: 'Please call before delivery in the afternoon.',
    items: [
      { name: 'Samsung 43" Crystal 4K Smart TV', qty: 1, price: 24641.5, color: 'Gloss Black' }
    ],
    total: 24641.5,
    status: 'New',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'qry_demo_102',
    type: 'query',
    customerName: 'Priya Sundaram',
    phone: '+91 94433 12345',
    message: 'Do you provide free installation for the RO Water purifier in Perundurai area?',
    items: [],
    total: 0,
    status: 'Contacted',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// In-memory cache with defaults for fallback
let memoryProducts: any[] = [...INITIAL_PRODUCTS];
let memoryOrders: any[] = [...INITIAL_ORDERS];
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

    // Auto-seed only on first initialization if settings flag is not set
    const meta = await db.collection('settings').findOne({ key: 'db_initialized' });
    if (!meta) {
      const count = await db.collection('products').countDocuments();
      if (count === 0) {
        await db.collection('products').insertMany(INITIAL_PRODUCTS);
        await db.collection('orders').insertMany(INITIAL_ORDERS);
      }
      await db.collection('settings').updateOne(
        { key: 'db_initialized' },
        { $set: { key: 'db_initialized', value: true, createdAt: new Date().toISOString() } },
        { upsert: true }
      );
    }

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
