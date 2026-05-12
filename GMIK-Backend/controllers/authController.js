import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedDisplayName = displayName?.trim();

    // Validation
    if (!normalizedEmail || !password || !normalizedDisplayName) {
      return res.status(400).json({ error: 'Email, password, and display name required' });
    }

    // Check if user exists
    const existingUser = query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    query(
      'INSERT INTO users (id, email, password_hash, display_name, email_verified) VALUES ($1, $2, $3, $4, $5)',
      [userId, normalizedEmail, hashedPassword, normalizedDisplayName, 1]
    );

    res.status(201).json({
      message: 'User registered successfully.',
      user: { id: userId, email: normalizedEmail, displayName: normalizedDisplayName }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = query('SELECT * FROM users WHERE email = $1 AND is_active = 1', [email]);
    console.log('Query result:', { rowCount: result.rows.length });
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, email_verified: user.email_verified });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      console.log('Email not verified');
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET + 'refresh',
      { expiresIn: '30d' }
    );

    console.log('Login successful:', { userId: user.id });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        profilePicture: user.profile_picture_url,
        completedTasks: user.completed_tasks_count
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    // TODO: Implement email verification logic
    // For MVP, you can implement a simple code-based verification
    
    query(
      'UPDATE users SET email_verified = 1 WHERE email = $1',
      [email]
    );

    const result = query('SELECT id, email FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Email verified successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET + 'refresh', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const newAccessToken = jwt.sign(
        { userId: user.userId, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
