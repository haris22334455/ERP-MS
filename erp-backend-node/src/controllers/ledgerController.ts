import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Get ledger entries for a specific shop
export const getShopLedger = async (req: Request, res: Response) => {
  try {
    const shopId = req.params.shopId as string;
    const ledger = await prisma.ledger.findMany({
      where: { shop_id: parseInt(shopId) },
      orderBy: { date: 'desc' }
    });
    res.json(ledger);
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ message: 'Server error while fetching ledger.' });
  }
};

// Add a manual transaction (like a payment received)
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { shop_id, type, amount, description, debit, credit } = req.body;
    const parsedShopId = parseInt(shop_id);

    // Support BOTH formats:
    // Format 1 (frontend ShopLedger): { shop_id, description, debit, credit }
    // Format 2 (original): { shop_id, type, amount, description }
    let isCredit: boolean;
    let txAmount: number;

    if (debit !== undefined || credit !== undefined) {
      // Format 1: frontend sends debit and credit values directly
      const debitVal = Number(debit || 0);
      const creditVal = Number(credit || 0);
      isCredit = creditVal > 0;
      txAmount = isCredit ? creditVal : debitVal;
    } else {
      // Format 2: uses type and amount
      isCredit = type === 'Credit';
      txAmount = Number(amount);
    }

    await prisma.$transaction(async (tx) => {
      const shop = await tx.shops.findUnique({ where: { shop_id: parsedShopId } });
      if (!shop) throw new Error('Shop not found');

      const newDebt = isCredit 
        ? Number(shop.total_debt) - txAmount 
        : Number(shop.total_debt) + txAmount;

      // Update shop debt
      await tx.shops.update({
        where: { shop_id: parsedShopId },
        data: { total_debt: newDebt }
      });

      // Add ledger entry
      await tx.ledger.create({
        data: {
          shop_id: parsedShopId,
          description,
          debit: isCredit ? 0 : txAmount,
          credit: isCredit ? txAmount : 0,
          balance: newDebt,
          date: new Date()
        }
      });
    });

    res.json({ message: 'Transaction added successfully.' });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Server error while adding transaction.' });
  }
};
