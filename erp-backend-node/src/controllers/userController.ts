import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client';

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        shop_id: true,
      }
    });
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, shop_id } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'staff',
        shop_id: shop_id || null,
      }
    });

    res.json({ message: 'User created successfully', userId: newUser.user_id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user.' });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.users.delete({
      where: { user_id: parseInt(id) }
    });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};

// Get registration requests (if any exist in the database)
export const getRegistrationRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.registration_requests.findMany();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    res.status(500).json({ message: 'Server error while fetching registration requests.' });
  }
};
