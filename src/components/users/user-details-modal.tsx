
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { User } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Mail, Shield, Activity, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/context/auth-context';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
}

const SUPER_ADMIN_UID = "7AP0JBOpAJQMpGX7ofDyATVxfk93";

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onEdit,
}: UserDetailsModalProps) {
  const { user: currentUser } = useAuth();
  if (!user) return null;

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'PPp');
  };

  const isSuperAdmin = user.id === SUPER_ADMIN_UID;
  const canModify = !isSuperAdmin || (isSuperAdmin && currentUser?.id === SUPER_ADMIN_UID);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={(user as any).avatar} alt={user.name} />
              <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-center gap-4">
            <Badge variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              {user.role}
            </Badge>
            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
              <Activity className="h-4 w-4 mr-2" />
              <span className="capitalize">{user.status}</span>
            </Badge>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>Date Created:</span>
              <span className="font-medium text-foreground">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Modified:</span>
              <span className="font-medium text-foreground">{formatDate(user.modifiedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Login:</span>
              <span className="font-medium text-foreground">{formatDate(user.lastLoginAt)}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={() => onEdit(user)} disabled={!canModify}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
