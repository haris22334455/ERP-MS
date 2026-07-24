import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { TokenBlacklist } from '../utils/TokenBlacklist';

const JWT_SECRET = process.env.JWT_SECRET || 'ErpMS@Secure#2026$RandomKey!XyZ789';

// Login a user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // We can login with either email or username. Let's check both.
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email || username },
          { username: username || email }
        ]
      }
    });

    // If user not found
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials. Wrong password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role, shopId: user.shop_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        shop_id: user.shop_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Logout a user by blacklisting their token
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization');
    if (token) {
      TokenBlacklist.add(token);
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout.' });
  }
};

// Forgot Password (Dummy implementation for now)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    // In a real app, send an email with a reset link here.
    res.json({ message: 'If this email exists, a password reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Reset Password (Dummy implementation for now)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    // In a real app, verify the token and update the password.
    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};
