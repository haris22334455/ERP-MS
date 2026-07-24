import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Book a new order
export const bookOrder = async (req: Request, res: Response) => {
  try {
    const { shop_id, items, total_amount, user_id } = req.body;
    
    const parsedShopId = shop_id ? parseInt(shop_id) : null;
    const parsedUserId = user_id ? parseInt(user_id) : null;
    const parsedTotal = Number(total_amount || 0);

    // Use a transaction to ensure everything saves together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.orders.create({
        data: {
          shop_id: parsedShopId,
          total_amount: parsedTotal,
          user_id: parsedUserId,
          status: 'pending',
          order_date: new Date()
        }
      });

      // 2. Add order items and reduce stock
      for (const item of items) {
        const prodId = parseInt(item.product_id || item.productId);
        const qty = Number(item.quantity);
        const price = Number(item.price_at_sale || item.priceAtSale);

        // Create order item
        await tx.order_items.create({
          data: {
            order_id: newOrder.order_id,
            product_id: prodId,
            quantity: qty,
            price_at_sale: price,
            returned_quantity: 0
          }
        });

        // Reduce product stock
        await tx.products.update({
          where: { id: prodId },
          data: {
            stock: { decrement: qty }
          }
        });
      }

      // 3. Add to shop debt and ledger (Assuming total_amount is added as debt)
      await tx.shops.update({
        where: { shop_id },
        data: {
          total_debt: { increment: total_amount }
        }
      });

      // Add a ledger entry (Debit)
      const shop = await tx.shops.findUnique({ where: { shop_id } });
      await tx.ledger.create({
        data: {
          shop_id,
          description: `Order #${newOrder.order_id}`,
          debit: total_amount,
          credit: 0,
          balance: shop?.total_debt,
          date: new Date()
        }
      });

      return newOrder;
    });

    res.json({ message: 'Order booked successfully', orderId: result.order_id });
  } catch (error) {
    console.error('Error booking order:', error);
    res.status(500).json({ message: 'Server error while booking order.' });
  }
};

// Get pending orders
export const getPendingOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { status: 'pending' },
      include: {
        shops: true,
        users: true
      },
      orderBy: { order_date: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        shops: true,
        users: true
      },
      orderBy: { order_date: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get order items by order ID
export const getOrderItems = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;
    const items = await prisma.order_items.findMany({
      where: { order_id: parseInt(orderId) },
      include: { products: true }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Deliver an order
export const deliverOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId as string);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format. Please refresh your browser.' });
    }

    await prisma.orders.update({
      where: { order_id: orderId },
      data: { status: 'delivered' }
    });
    res.json({ message: 'Order marked as delivered.' });
  } catch (error) {
    console.error('Error delivering order:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Cancel an order (Revert stock and ledger)
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId as string);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format. Please refresh your browser.' });
    }
    
    await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({ 
        where: { order_id: orderId },
        include: { order_items: true } 
      });

      if (!order || order.status === 'cancelled') return;

      // Revert stock
      for (const item of order.order_items) {
        await tx.products.update({
          where: { id: item.product_id! },
          data: { stock: { increment: item.quantity } }
        });
      }

      // Revert debt
      if (order.shop_id && order.total_amount) {
        await tx.shops.update({
          where: { shop_id: order.shop_id },
          data: { total_debt: { decrement: order.total_amount } }
        });

        // Add ledger entry for cancellation (Credit)
        const shop = await tx.shops.findUnique({ where: { shop_id: order.shop_id } });
        await tx.ledger.create({
          data: {
            shop_id: order.shop_id,
            description: `Order #${order.order_id} Cancelled`,
            debit: 0,
            credit: order.total_amount,
            balance: shop?.total_debt,
            date: new Date()
          }
        });
      }

      // Mark order as cancelled
      await tx.orders.update({
        where: { order_id: orderId },
        data: { status: 'cancelled' }
      });
    });

    res.json({ message: 'Order cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Return order items
export const returnOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId as string);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format. Please refresh your browser.' });
    }

    const { items } = req.body;
    
    await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({ where: { order_id: orderId } });
      if (!order) throw new Error("Order not found");

      let totalRefund = 0;

      for (const item of items) {
        const prodId = parseInt(item.productId || item.product_id);
        const qty = Number(item.quantity);

        // Find original order item
        const orderItem = await tx.order_items.findFirst({
          where: { order_id: orderId, product_id: prodId }
        });

        if (orderItem) {
          totalRefund += Number(orderItem.price_at_sale) * qty;
          
          await tx.order_items.update({
            where: { item_id: orderItem.item_id },
            data: { returned_quantity: { increment: qty } }
          });

          await tx.products.update({
            where: { id: prodId },
            data: { stock: { increment: qty } }
          });
        }
      }

      // Deduct from debt
      if (order.shop_id && totalRefund > 0) {
        await tx.shops.update({
          where: { shop_id: order.shop_id },
          data: { total_debt: { decrement: totalRefund } }
        });

        const shop = await tx.shops.findUnique({ where: { shop_id: order.shop_id } });
        await tx.ledger.create({
          data: {
            shop_id: order.shop_id,
            description: `Returned items for Order #${orderId}`,
            debit: 0,
            credit: totalRefund,
            balance: shop?.total_debt,
            date: new Date()
          }
        });
      }

      // Mark order as partially returned or returned
      await tx.orders.update({
        where: { order_id: orderId },
        data: { status: 'partially returned' }
      });
    });

    res.json({ message: 'Return processed successfully.' });
  } catch (error) {
    console.error('Error returning order:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
