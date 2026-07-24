import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Get paginated products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;

    const skip = page * size;
    
    // Using is_deleted logic if available, else just fetch all.
    // Assuming is_deleted is a boolean, if it's null it means it's active.
    const whereClause = {
      OR: [
        { is_deleted: false },
        { is_deleted: null }
      ]
    };

    const totalElements = await prisma.products.count({ where: whereClause });
    const content = await prisma.products.findMany({
      where: whereClause,
      skip,
      take: size,
      orderBy: { id: 'asc' }
    });

    res.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      number: page
    });
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
};

// Get all products (without pagination)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        OR: [
          { is_deleted: false },
          { is_deleted: null }
        ]
      },
      orderBy: { item_name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Server error while fetching all products.' });
  }
};

// Get low stock products
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    // In Prisma, we can't do "where stock < minimum_threshold" easily in a single findMany without raw SQL, 
    // but if minimum_threshold is static we can fetch all and filter in JS if the DB is small, 
    // or use queryRaw. Let's use queryRaw for accuracy.
    const lowStockProducts = await prisma.$queryRaw`SELECT * FROM products WHERE stock <= minimum_threshold AND (is_deleted = false OR is_deleted IS NULL)`;
    
    res.json(lowStockProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Server error while fetching low stock products.' });
  }
};

// Search products by name
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string;
    if (!keyword) {
      return res.json([]);
    }

    const products = await prisma.products.findMany({
      where: {
        item_name: {
          contains: keyword,
          mode: 'insensitive' // Postgres case-insensitive search
        },
        OR: [
          { is_deleted: false },
          { is_deleted: null }
        ]
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error while searching products.' });
  }
};

// Add a new product
export const addProduct = async (req: Request, res: Response) => {
  try {
    const { item_name, brand, brand_name, company_name, price, stock, minimum_threshold } = req.body;
    const newProduct = await prisma.products.create({
      data: {
        item_name,
        brand,
        brand_name,
        company_name,
        price: price ? Number(price) : null,
        stock: stock ? Number(stock) : null,
        minimum_threshold: minimum_threshold ? Number(minimum_threshold) : 10,
        is_deleted: false
      }
    });
    res.json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error while adding product.' });
  }
};

// Update an existing product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updateData = { ...req.body };
    
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.minimum_threshold !== undefined) updateData.minimum_threshold = Number(updateData.minimum_threshold);

    const updatedProduct = await prisma.products.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product.' });
  }
};

// Delete a product (Soft delete to keep order history intact)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.products.update({
      where: { id: parseInt(id) },
      data: { is_deleted: true }
    });
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
};
