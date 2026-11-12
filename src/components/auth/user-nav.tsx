'use client';

import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  const { toast } = useToast();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });

      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      } catch {
        // ignore storage cleanup errors
      }
      window.location.href = `${window.location.origin}/login`;
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="relative h-10 w-10 overflow-hidden rounded-full p-0"
          aria-label="Open account menu"
        >
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.email || 'User'}
              fill
              className="rounded-full object-cover"
              sizes="40px"
            />
          ) : (
            <UserIcon className="!size-5 text-warm-600" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[16rem] truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
