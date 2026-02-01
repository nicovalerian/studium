'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/file-processing';

interface FileUploadProps {
  classId: string;
  onUploadComplete: () => void;
}

export function FileUpload({ classId, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Only PDF and DOCX files are allowed.',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('class_id', classId);

      try {
        setProgress(30);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        setProgress(70);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setProgress(100);

        if (data.embedding_status === 'failed') {
          toast({
            title: 'Upload complete, processing failed',
            description:
              data.error_message ||
              'Document processing failed. You can retry from the documents list.',
            variant: 'destructive',
          });
        } else if (data.was_truncated) {
          toast({
            title: 'Document uploaded',
            description: 'Document was truncated to ~22,500 words due to size limits.',
          });
        } else {
          toast({
            title: 'Document uploaded',
            description: 'Processing will begin shortly.',
          });
        }

        onUploadComplete();
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [classId, onUploadComplete, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : isDragActive ? (
            <FileText className="h-10 w-10 text-primary" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <div>
            {isDragActive ? (
              <p className="text-primary">Drop the file here</p>
            ) : (
              <>
                <p className="font-medium">Drag & drop a file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">PDF or DOCX, max 10MB</p>
        </div>
      </div>
      {isUploading && <Progress value={progress} />}
    </div>
  );
}
