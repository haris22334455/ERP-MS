import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client';
import { sendApprovalEmail } from '../utils/mailer';

// 1. Submit Registration Request (Public)
export const submitRequest = async (req: Request, res: Response) => {
  try {
    const { fullname, businessname, email, phone, password } = req.body;

    // Validate inputs
    if (!fullname || !businessname || !email || !password) {
      return res.status(400).json({ message: 'Full name, business name, email, and password are required.' });
    }

    // Check if email already exists in registration requests (pending) or actual users table
    const existingUser = await prisma.users.findUnique({ where: { email } });
    const existingRequest = await prisma.registration_requests.findUnique({ where: { email } });

    if (existingUser || (existingRequest && existingRequest.status === 'pending')) {
      return res.status(409).json({ message: 'Email is already registered or a request is pending.' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save request
    await prisma.registration_requests.create({
      data: {
        fullname,
        businessname,
        email,
        phone: phone || null,
        password: hashedPassword,
        status: 'pending',
        createdat: new Date()
      }
    });

    res.status(201).json({ message: 'Registration request submitted successfully. Please wait for admin approval.' });
  } catch (error) {
    console.error('Error submitting registration request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// 2. Get All Pending Requests (Admin)
export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.registration_requests.findMany({
      where: { status: 'pending' },
      orderBy: { createdat: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// 3. Approve Registration Request (Admin)
export const approveRequest = async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id as string);
    const request = await prisma.registration_requests.findUnique({ where: { id: requestId } });

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found.' });
    }

    // Use a transaction to ensure both Shop and User are created atomically
    await prisma.$transaction(async (tx) => {
      // 1. Create the Shop
      const newShop = await tx.shops.create({
        data: {
          shop_name: request.businessname || request.fullname,
          shop_address: 'N/A',
          total_debt: 0.00
        }
      });

      // 2. Create the User (Shopkeeper)
      await tx.users.create({
        data: {
          username: request.fullname, // Or handle unique username generation
          email: request.email,
          password: request.password, // Already hashed during signup
          role: 'shopkeeper',
          shop_id: newShop.shop_id.toString()
        }
      });

      // 3. Update Request Status
      await tx.registration_requests.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          reviewedat: new Date()
        }
      });
    });

    // Send the beautiful HTML email!
    await sendApprovalEmail(request.email, request.fullname, request.businessname || '', '');

    res.json({ message: 'Registration request approved successfully.' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Internal server error while approving request.' });
  }
};

// 4. Reject Registration Request (Admin)
export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id as string);
    
    await prisma.registration_requests.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reviewedat: new Date()
      }
    });

    res.json({ message: 'Registration request rejected.' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Internal server error while rejecting request.' });
  }
};
