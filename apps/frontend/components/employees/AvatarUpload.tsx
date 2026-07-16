'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn, getInitials } from '@/lib/utils';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  currentImage?: string | null;
  name: string;
  onUpload: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-12 w-12', md: 'h-20 w-20', lg: 'h-24 w-24' };
const textSizes = { sm: 'text-sm', md: 'text-lg', md2: 'text-xl', lg: 'text-2xl' };

export function AvatarUpload({ currentImage, name, onUpload, size = 'lg' }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload<{ success: boolean; data: { url: string } }>('/api/upload', formData);
      onUpload(res.data.url);
      toast.success('Photo updated');
    } catch {
      setPreview(currentImage || null);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [currentImage, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-full cursor-pointer ring-2 ring-transparent transition-all group',
        sizes[size],
        isDragActive && 'ring-primary ring-offset-2 scale-110',
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <img src={preview} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold">{getInitials(name)}</span>
        </div>
      )}
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white text-xs opacity-0 transition-opacity',
          (isDragActive || uploading) && 'opacity-100',
          !uploading && 'group-hover:opacity-100',
        )}
      >
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
      </div>
    </div>
  );
}
