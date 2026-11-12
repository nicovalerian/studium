'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/file-processing';
import type { WorkspaceAccessState } from '@/lib/auth/access';
import { cn } from '@/lib/utils';

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

  if (isBlocked) {
    // The dropzone stays mounted (click and keyboard disabled) so a dropped file still opens
    // the sign-in prompt instead of the browser navigating to it.
    return (
      <div {...getRootProps({ className: 'rounded-xl' })}>
        <input {...getInputProps()} tabIndex={-1} aria-hidden="true" />
        <button
          type="button"
          onClick={onBlockedAction}
          className="group flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-warm-300 bg-warm-50 p-5 text-center transition-colors duration-200 hover:border-primary/50 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:p-6"
        >
          <Lock
            className="h-6 w-6 text-warm-400 transition-colors group-hover:text-primary"
            aria-hidden="true"
          />
          <span className="font-semibold text-warm-800">
            {workspaceState === 'guest' ? 'Sign in to upload' : 'Verify your email to upload'}
          </span>
          <span className="text-xs text-warm-500">PDF or DOCX, max 10MB</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-xl border border-dashed p-5 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:p-6',
          isDragActive
            ? 'border-primary bg-terracotta-light'
            : 'border-warm-300 bg-warm-50 hover:border-primary/50 hover:bg-secondary/60',
          isUploading && 'pointer-events-none'
        )}
      >
        <input {...getInputProps()} aria-label="Upload a PDF or DOCX file" />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
          ) : isDragActive ? (
            <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          ) : (
            <Upload className="h-7 w-7 text-warm-400" aria-hidden="true" />
          )}
          <div>
            {isUploading ? (
              <p className="font-semibold text-warm-800">Uploading…</p>
            ) : isDragActive ? (
              <p className="font-semibold text-primary">Drop the file here</p>
            ) : (
              <>
                <p className="font-semibold text-warm-800">Drag & drop a file here</p>
                <p className="text-sm text-warm-500">or click to browse</p>
              </>
            )}
          </div>
          <p className="text-xs text-warm-500">PDF or DOCX, max 10MB</p>
        </div>
      </div>

      {isUploading && (
        <Progress value={progress} aria-label="Upload progress" className="h-1.5 bg-warm-200" />
      )}
    </div>
  );
}
