import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Get all expenses
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expenses.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error while fetching expenses.' });
  }
};

// Add a new expense
export const addExpense = async (req: Request, res: Response) => {
  try {
    const { description, amount, category } = req.body;
    
    const newExpense = await prisma.expenses.create({
      data: {
        description,
        amount,
        category,
        date: new Date()
      }
    });
    res.json(newExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server error while adding expense.' });
  }
};
