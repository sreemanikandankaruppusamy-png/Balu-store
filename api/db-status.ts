import { VercelRequest, VercelResponse } from '@vercel/node';
import { isMongoActive, dbGetProducts, dbGetOrders } from './lib/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const isMongo = isMongoActive();
    const products = await dbGetProducts();
    const orders = await dbGetOrders();

    const dbType = isMongo 
      ? 'MongoDB Atlas Cloud Database 🍃' 
      : 'Serverless Cache (Configure MONGODB_URI in Vercel)';

    return res.status(200).json({
      success: true,
      database: {
        type: dbType,
        status: isMongo ? 'Connected 🟢' : 'Fallback Mode 🟡',
        provider: isMongo ? 'mongodb' : 'memory'
      },
      counts: {
        totalProducts: products.length,
        publishedProducts: products.filter(p => p.published).length,
        totalOrders: orders.length,
        newOrders: orders.filter(o => o.status === 'New').length
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
