import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Get all shops
export const getShops = async (req: Request, res: Response) => {
  try {
    const shops = await prisma.shops.findMany({
      orderBy: { shop_name: 'asc' }
    });
    res.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'Server error while fetching shops.' });
  }
};

// Add a new shop
export const addShop = async (req: Request, res: Response) => {
  try {
    const { shop_name, shop_address } = req.body;
    const newShop = await prisma.shops.create({
      data: {
        shop_name,
        shop_address,
        total_debt: 0.00
      }
    });
    res.json(newShop);
  } catch (error) {
    console.error('Error adding shop:', error);
    res.status(500).json({ message: 'Server error while adding shop.' });
  }
};

// Delete a shop
export const deleteShop = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.shops.delete({
      where: { shop_id: parseInt(id) }
    });
    res.json({ message: 'Shop deleted successfully.' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ message: 'Server error while deleting shop.' });
  }
};

// Get market summary (total shops, total market debt)
export const getMarketSummary = async (req: Request, res: Response) => {
  try {
    const totalShops = await prisma.shops.count();
    const aggregate = await prisma.shops.aggregate({
      _sum: {
        total_debt: true
      }
    });
    
    res.json({
      totalShops,
      totalMarketDebt: aggregate._sum.total_debt || 0
    });
  } catch (error) {
    console.error('Error fetching market summary:', error);
    res.status(500).json({ message: 'Server error while fetching market summary.' });
  }
};
