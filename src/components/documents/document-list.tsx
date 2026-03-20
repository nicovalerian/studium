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
import { useToast } from '@/hooks/use-toast';

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

function StatusBadge({ status }: { status: Document['embedding_status'] }) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="secondary"
          className="w-fit gap-1 bg-[hsl(var(--warm-200))] text-[hsl(var(--warm-600))]"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Pending
        </Badge>
      );
    case 'processing':
      return (
        <Badge
          variant="secondary"
          className="w-fit gap-1 bg-[hsl(var(--sand-light))] text-[hsl(var(--sand))]"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="default" className="w-fit gap-1 bg-[hsl(var(--sage))] text-white">
          <CheckCircle className="h-3 w-3" />
          Ready
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="w-fit gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
  }
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
      <div className="py-8 text-center text-[hsl(var(--warm-500))]">
        <FileText className="mx-auto h-12 w-12 text-[hsl(var(--warm-300))]" />
        <p className="mt-2">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        {isReadOnly ? (
          <p className="text-sm text-[hsl(var(--warm-500))]">Documents are view-only right now.</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.size === documents.length && documents.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all documents"
                className="border-[hsl(var(--warm-300))] data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <span className="text-sm text-[hsl(var(--warm-500))]">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </span>
            </div>

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
                <AlertDialogContent className="border-[hsl(var(--warm-200))]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-[hsl(var(--warm-800))]">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete {selectedIds.size} document{selectedIds.size > 1 ? 's' : ''}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2 text-[hsl(var(--warm-600))]">
                      <p>This action cannot be undone. The following will be permanently deleted:</p>
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
                          Warning: Some selected documents have already been processed. Deleting them
                          will remove their context from the AI chat.
                        </p>
                      ) : null}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      disabled={isDeleting}
                      className="border-[hsl(var(--warm-300))]"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBatchDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
              !isReadOnly && selectedIds.has(doc.id)
                ? 'border-primary bg-[hsl(var(--terracotta-light))]'
                : 'border-[hsl(var(--warm-200))] hover:border-[hsl(var(--warm-300))] hover:bg-[hsl(var(--warm-100))]'
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {!isReadOnly ? (
                <Checkbox
                  checked={selectedIds.has(doc.id)}
                  onCheckedChange={() => toggleSelection(doc.id)}
                  aria-label={`Select ${doc.display_name || doc.filename}`}
                  className="border-[hsl(var(--warm-300))] data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
              ) : null}
              <FileText className="h-5 w-5 text-[hsl(var(--warm-400))]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[hsl(var(--warm-800))]">
                  {doc.display_name || doc.filename}
                </p>
                <div className="flex flex-col items-start gap-1">
                  <p className="text-xs text-[hsl(var(--warm-500))]">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                  <StatusBadge status={doc.embedding_status} />
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
                      className="h-8 w-8 text-[hsl(var(--warm-400))] hover:bg-[hsl(var(--warm-100))] hover:text-destructive"
                      onClick={() => setSingleDeleteId(doc.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete {doc.display_name || doc.filename}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-[hsl(var(--warm-200))]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-[hsl(var(--warm-800))]">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete document?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2 text-[hsl(var(--warm-600))]">
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
                      <AlertDialogCancel
                        disabled={isDeleting}
                        className="border-[hsl(var(--warm-300))]"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleSingleDelete(doc.id)}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
