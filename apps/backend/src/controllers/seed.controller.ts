import { Request, Response } from 'express';
import { seedSuperAdmin } from '../config/seed';

export async function seed(_req: Request, res: Response): Promise<void> {
  try {
    await seedSuperAdmin();
    res.json({ success: true, message: 'Seed completed successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: 'Seed failed' });
  }
}
