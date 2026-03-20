'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/file-processing';
import type { WorkspaceAccessState } from '@/lib/auth/access';

interface FileUploadProps {
  classId: string | null;
  onUploadComplete: () => void;
  workspaceState?: WorkspaceAccessState;
  onBlockedAction?: () => void;
}

export function FileUpload({
  classId,
  onUploadComplete,
  workspaceState = 'verified',
  onBlockedAction,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const isBlocked = workspaceState !== 'verified';

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isBlocked || !classId) {
        onBlockedAction?.();
        return;
      }

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
    [classId, isBlocked, onBlockedAction, onUploadComplete, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: isUploading,
    noClick: isBlocked,
    noKeyboard: isBlocked,
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-[hsl(var(--terracotta-light))]'
              : 'border-[hsl(var(--warm-300))] hover:border-primary/50 hover:bg-[hsl(var(--warm-100))]'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--warm-400))]" />
            ) : isDragActive ? (
              <FileText className="h-10 w-10 text-primary" />
            ) : (
              <Upload className="h-10 w-10 text-[hsl(var(--warm-400))]" />
            )}
            <div>
              {isDragActive ? (
                <p className="font-medium text-primary">Drop the file here</p>
              ) : (
                <>
                  <p className="font-medium text-[hsl(var(--warm-700))]">Drag & drop a file here</p>
                  <p className="text-sm text-[hsl(var(--warm-500))]">or click to browse</p>
                </>
              )}
            </div>
            <p className="text-xs text-[hsl(var(--warm-400))]">PDF or DOCX, max 10MB</p>
          </div>
        </div>

        {isBlocked ? (
          <button
            type="button"
            onClick={onBlockedAction}
            className="absolute inset-0 z-10 rounded-xl bg-white/70 backdrop-blur-[2px]"
          >
            <span className="sr-only">Unlock uploads</span>
          </button>
        ) : null}
      </div>

      {isBlocked ? (
        <p className="text-center text-xs text-[hsl(var(--warm-500))]">
          {workspaceState === 'guest'
            ? 'Sign in to upload PDFs or DOCX files.'
            : 'Verify your email to upload study materials.'}
        </p>
      ) : null}

      {isUploading && (
        <Progress value={progress} className="h-2 bg-[hsl(var(--warm-200))] [&>*]:bg-primary" />
      )}
    </div>
  );
}
