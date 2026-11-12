'use client';

import { useState } from 'react';
import { FileText, Loader2, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { easeOut } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  filename: string;
  display_name: string | null;
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface DocumentListProps {
  documents: Document[];
  onDocumentsDeleted?: () => void;
  isReadOnly?: boolean;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'neutral', icon: Loader2, spin: true },
  processing: { label: 'Processing', variant: 'info', icon: Loader2, spin: true },
  completed: { label: 'Ready', variant: 'success', icon: CheckCircle, spin: false },
  failed: { label: 'Failed', variant: 'danger', icon: XCircle, spin: false },
} as const;

function StatusBadge({ status }: { status: Document['embedding_status'] }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="w-fit">
      <Icon className={cn('h-3 w-3', config.spin && 'animate-spin')} aria-hidden="true" />
      {config.label}
    </Badge>
  );
}

export function DocumentList({
  documents,
  onDocumentsDeleted,
  isReadOnly = false,
}: DocumentListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map((d) => d.id)));
    }
  };

  const deleteDocuments = async (ids: string[]) => {
    setIsDeleting(true);
    try {
      if (ids.length === 1) {
        const response = await fetch(`/api/documents/${ids[0]}`, { method: 'DELETE' });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete document');
        }
      } else {
        const response = await fetch('/api/documents/batch', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_ids: ids }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete documents');
        }
      }

      toast({
        title: 'Documents deleted',
        description: `Successfully deleted ${ids.length} document${ids.length > 1 ? 's' : ''}.`,
      });

      setSelectedIds(new Set());
      onDocumentsDeleted?.();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSingleDeleteId(null);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    deleteDocuments(Array.from(selectedIds));
  };

  const handleSingleDelete = (id: string) => {
    deleteDocuments([id]);
  };

  const selectedDocuments = documents.filter((d) => selectedIds.has(d.id));
  const hasEmbeddedDocuments = selectedDocuments.some((d) => d.embedding_status === 'completed');

  if (documents.length === 0) {
    return (
      <div className="rounded-xl bg-warm-50 px-4 py-8 text-center">
        <FileText className="mx-auto h-7 w-7 text-warm-300" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-warm-700">No documents yet</p>
        <p className="mt-1 text-sm text-warm-500">Uploaded files appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        {isReadOnly ? (
          <p className="text-sm text-warm-500">Documents are view-only right now.</p>
        ) : (
          <>
            <label className="flex min-h-9 cursor-pointer items-center gap-2.5 pl-3 text-sm text-warm-600">
              <Checkbox
                checked={selectedIds.size === documents.length && documents.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all documents"
              />
              <span className="tabular-nums">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </span>
            </label>

            {selectedIds.size > 0 ? (
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-warm-800">
                      <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
                      Delete {selectedIds.size} document{selectedIds.size > 1 ? 's' : ''}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2 text-warm-600">
                      <p>
                        This action cannot be undone. The following will be permanently deleted:
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        <li>Document files from storage</li>
                        {hasEmbeddedDocuments ? (
                          <li className="font-medium text-destructive">
                            All embedded context and search data
                          </li>
                        ) : null}
                      </ul>
                      {hasEmbeddedDocuments ? (
                        <p className="mt-2 text-sm font-medium text-destructive">
                          Warning: Some selected documents have already been processed. Deleting
                          them will remove their context from the AI chat.
                        </p>
                      ) : null}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBatchDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </>
        )}
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {documents.map((doc) => (
            <motion.li
              key={doc.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={easeOut}
              className={cn(
                'flex items-center justify-between gap-2 rounded-xl border p-3 transition-colors duration-200',
                !isReadOnly && selectedIds.has(doc.id)
                  ? 'border-primary/60 bg-terracotta-light'
                  : 'border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50'
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {!isReadOnly ? (
                  <Checkbox
                    checked={selectedIds.has(doc.id)}
                    onCheckedChange={() => toggleSelection(doc.id)}
                    aria-label={`Select ${doc.display_name || doc.filename}`}
                  />
                ) : null}
                <FileText className="h-5 w-5 shrink-0 text-warm-400" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold text-warm-800"
                    title={doc.display_name || doc.filename}
                  >
                    {doc.display_name || doc.filename}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={doc.embedding_status} />
                    <time dateTime={doc.created_at} className="text-xs tabular-nums text-warm-500">
                      {new Date(doc.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </div>

              {!isReadOnly ? (
                <div className="relative z-10">
                  <AlertDialog
                    open={singleDeleteId === doc.id}
                    onOpenChange={(open) => !open && setSingleDeleteId(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-warm-500 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setSingleDeleteId(doc.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 aria-hidden="true" />
                        <span className="sr-only">Delete {doc.display_name || doc.filename}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-warm-800">
                          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
                          Delete document?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2 text-warm-600">
                          <p>
                            Are you sure you want to delete &quot;{doc.display_name || doc.filename}
                            &quot;?
                          </p>
                          {doc.embedding_status === 'completed' ? (
                            <p className="font-medium text-destructive">
                              Warning: This document has been processed. Deleting it will remove its
                              context from the AI chat.
                            </p>
                          ) : null}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleSingleDelete(doc.id)}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : null}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
