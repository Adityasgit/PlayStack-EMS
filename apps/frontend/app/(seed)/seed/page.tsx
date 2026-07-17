'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res: any = await api.post('/api/seed', {});
      toast.success(res.message || 'Seed completed!');
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || 'Seed failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-card rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
        <Database className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold gradient-text mb-2">Database Seeder</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Populate the database with sample employees, departments, and tasks.
        </p>

        <Button
          onClick={handleSeed}
          disabled={loading || done}
          className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/25"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : done ? (
            '✓ Seeded Successfully'
          ) : (
            'Run Seed'
          )}
        </Button>
      </div>
    </div>
  );
}
