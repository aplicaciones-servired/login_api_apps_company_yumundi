import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserI } from '@/types/User';
import axios from 'axios';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DialogUserDeleteProps {
  user: UserI | null;
  onClose: () => void;
  reload: () => void;
}

export const DialogUserDelete = ({ user, onClose, reload }: DialogUserDeleteProps) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const res = await axios.delete(`/user/${user.id}`);
      if (res.status === 200) {
        onClose();
        reload();
        toast.success('Usuario eliminado correctamente', {
          description: `${user.names} ${user.lastnames}`,
        });
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError<{ message?: string }>(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Error al eliminar el usuario');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!open && !submitting) onClose();
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='mb-1 flex items-center gap-2.5'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive'>
              <AlertTriangle className='size-5' />
            </div>
            <DialogTitle>Eliminar usuario</DialogTitle>
          </div>
          <DialogDescription>
            Esta acción es permanente y no se puede deshacer. El usuario perderá el acceso inmediatamente.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className='rounded-lg border bg-muted/40 p-3.5 text-sm'>
            <p className='font-semibold text-foreground'>
              {user.names} {user.lastnames}
            </p>
            <p className='text-xs text-muted-foreground'>{user.email}</p>
            <p className='mt-1 font-mono text-xs text-muted-foreground'>
              Documento: {user.document}
            </p>
          </div>
        )}

        <DialogFooter className='pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleDelete}
            disabled={submitting}
          >
            <Trash2 className='size-4' />
            {submitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
