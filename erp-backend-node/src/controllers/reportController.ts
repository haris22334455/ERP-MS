import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Get daily report
export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await prisma.orders.findMany({
      where: { order_date: { gte: today } }
    });

    const ledger = await prisma.ledger.findMany({
      where: { date: { gte: today } }
    });

    const totalSales = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const totalCashReceived = ledger.reduce((sum, l) => sum + Number(l.credit || 0), 0);

    const dateStr = `${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`;

    res.json({
      date: dateStr,
      summary: {
        total_sales_on_credit: totalSales,
        total_cash_received: totalCashReceived,
        net_balance: totalSales - totalCashReceived
      }
    });
  } catch (error) {
    console.error('Error in daily report:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get monthly report
export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const orders = await prisma.orders.findMany({
      where: { order_date: { gte: startDate, lte: endDate } }
    });

    const ledger = await prisma.ledger.findMany({
      where: { date: { gte: startDate, lte: endDate } }
    });

    const totalSales = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const monthly_recovery = ledger.reduce((sum, l) => sum + Number(l.credit || 0), 0);

    res.json({
      total_transactions: orders.length,
      monthly_sales: totalSales,
      monthly_recovery: monthly_recovery,
      monthly_balance: totalSales - monthly_recovery
    });
  } catch (error) {
    console.error('Error in monthly report:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get ledger report (weekly/monthly/yearly etc)
export const getLedgerReport = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'weekly';
    
    // In a real system, you'd filter by 'period'.
    // For simplicity, we fetch recent 500 ledgers.
    const ledgers = await prisma.ledger.findMany({
      include: { shops: true },
      orderBy: { date: 'desc' },
      take: 500
    });

    const formattedLedger = ledgers.map(l => {
      const dateObj = new Date(l.date || new Date());
      const formatted_date = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
      return {
        formatted_date,
        shop_name: l.shops?.shop_name,
        description: l.description,
        cash_in: Number(l.debit || 0), // sales added to debt
        cash_out: Number(l.credit || 0), // recovery received
        balance: Number(l.balance || 0)
      };
    });

    res.json(formattedLedger);
  } catch (error) {
    console.error('Error in ledger report:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get staff sales
export const getStaffSales = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.orders.findMany({
      include: { users: true }
    });

    const staffSalesMap: Record<string, number> = {};

    orders.forEach(order => {
      const staffName = order.users?.username || 'Unknown';
      if (!staffSalesMap[staffName]) staffSalesMap[staffName] = 0;
      staffSalesMap[staffName] += Number(order.total_amount || 0);
    });

    const staffSales = Object.entries(staffSalesMap).map(([staff, totalSales]) => ({
      staff,
      totalSales
    }));

    res.json(staffSales);
  } catch (error) {
    console.error('Error in staff sales:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get detailed sales
export const getDetailedSales = async (req: Request, res: Response) => {
  try {
    // Just return all orders for now to keep it simple
    const orders = await prisma.orders.findMany({
      include: { shops: true, users: true },
      orderBy: { order_date: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error in detailed sales:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get recovery status
export const getRecoveryStatus = async (req: Request, res: Response) => {
  try {
    // Return ledger entries that are 'Credit' (Payments received)
    const recoveries = await prisma.ledger.findMany({
      where: { credit: { gt: 0 } },
      include: { shops: true },
      orderBy: { date: 'desc' }
    });
    
    const totalRecovered = recoveries.reduce((sum, rec) => sum + Number(rec.credit || 0), 0);
    
    res.json({
      totalRecovered,
      recoveries
    });
  } catch (error) {
    console.error('Error in recovery status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get net profit
export const getNetProfit = async (req: Request, res: Response) => {
  try {
    // Similar to daily/monthly, but overall
    const totalSalesAggr = await prisma.orders.aggregate({ _sum: { total_amount: true } });
    const totalExpensesAggr = await prisma.expenses.aggregate({ _sum: { amount: true } });
    
    const sales = Number(totalSalesAggr._sum.total_amount || 0);
    const expenses = Number(totalExpensesAggr._sum.amount || 0);
    
    res.json({
      gross_sales: sales,
      total_expenses: expenses,
      net_profit: sales - expenses,
      status: (sales - expenses) >= 0 ? 'Profit' : 'Loss'
    });
  } catch (error) {
    console.error('Error in net profit:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
