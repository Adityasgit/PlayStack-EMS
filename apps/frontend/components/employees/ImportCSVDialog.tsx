'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCSVDialog({ open, onOpenChange }: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number; errors: any[] } | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload<any>('/api/employees/import', formData);
      setResult(res.data);
      if (res.data.imported > 0) toast.success(`${res.data.imported} employees imported`);
      if (res.data.failed > 0) toast.warning(`${res.data.failed} rows failed`);
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Employees from CSV</DialogTitle>
          <DialogDescription>Upload a CSV file with employee data. Required fields: name, email, password, department, designation.</DialogDescription>
        </DialogHeader>

        {!result ? (
          <>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">Drop CSV file here or click to browse</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={!file || loading} className="flex-1">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Import
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium">{result.imported} employees imported</span>
            </div>
            {result.failed > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/10">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-medium">{result.failed} rows failed</span>
              </div>
            )}
            <Button onClick={() => onOpenChange(false)} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
