import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-openspace';

// In-memory user store for demo purposes (replace with database in production)
const users: any[] = [];

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      fullName,
      password: hashedPassword,
      avatarInitials: fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      // For demo purposes, we auto-create SRK account if it doesn't exist
      if (email === 'srk@openspace.ai') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
          id: 'user-0001',
          email: 'srk@openspace.ai',
          fullName: 'SRK',
          password: hashedPassword,
          avatarInitials: 'SRK'
        };
        users.push(newUser);
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(200).json({ token, user: userWithoutPassword });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
