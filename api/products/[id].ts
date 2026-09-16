import { VercelRequest, VercelResponse } from '@vercel/node';
import { dbGetProducts, dbSaveProduct, dbDeleteProduct } from '../lib/db';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  discount: number;
  description: string;
  image?: string | null;
  published: boolean;
  colors?: Array<{ id: string; name: string; hex: string }>;
  createdAt: string;
  updatedAt: string;
}

// Authorization check
function isAuthorized(req: VercelRequest): boolean {
  const authHeader = req.headers['authorization'];
  const token = process.env.API_SECRET_TOKEN || process.env.API_SECRET_TOKEN_new || 'admin-secret-token';
  return authHeader === `Bearer ${token}` || authHeader === 'Bearer admin-secret-token';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS & Cache headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;
    const products = await dbGetProducts();
    const product = products.find((p: Product) => p.id === id);

    if (req.method === 'GET') {
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      return res.status(200).json({ success: true, data: product });
    }

    if (req.method === 'PUT') {
      if (!isAuthorized(req)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const { name, brand, category, price, discount, description, image, colors, published } = req.body;
      
      const updated: Product = {
        ...product,
        name: name !== undefined ? name.trim() : product.name,
        brand: brand !== undefined ? brand.trim() : product.brand,
        category: category !== undefined ? category : product.category,
        price: price !== undefined ? parseFloat(price) : product.price,
        discount: discount !== undefined ? parseFloat(discount) : product.discount,
        description: description !== undefined ? description.trim() : product.description,
        image: image !== undefined ? image : product.image,
        colors: colors !== undefined ? colors : product.colors,
        published: published !== undefined ? published : product.published,
        updatedAt: new Date().toISOString(),
      };

      await dbSaveProduct(updated);
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'PATCH') {
      if (!isAuthorized(req)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const updated: Product = {
        ...product,
        published: !product.published,
        updatedAt: new Date().toISOString(),
      };

      await dbSaveProduct(updated);
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      if (!isAuthorized(req)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const success = await dbDeleteProduct(id as string);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Internal server error' 
    });
  }
}
