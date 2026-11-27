import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCompany, formatDate, formatEnumLabel, getInitials } from '@/lib/formatters';
import { UserI } from '@/types/User';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Mail,
  Pencil,
  Phone,
  Shield,
} from 'lucide-react';
import { ReactNode } from 'react';

interface DialogUserDetailProps {
  user: UserI | null;
  onClose: () => void;
  canManage: boolean;
  onEdit: (user: UserI) => void;
}

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}

function DetailItem({ icon, label, value, className }: DetailItemProps) {
  return (
    <div className='flex items-start gap-3 rounded-lg border bg-muted/30 p-3'>
      <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-xs'>
        {icon}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-medium text-muted-foreground'>{label}</p>
        <p className={`truncate text-sm font-medium text-foreground ${className ?? ''}`} title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

export const DialogUserDetail = ({
  user,
  onClose,
  canManage,
  onEdit,
}: DialogUserDetailProps) => {
  const isActive = user?.state === 'Activo';

  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Detalle de usuario</DialogTitle>
          <DialogDescription>
            Información general y asignación organizacional registrada en el sistema.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className='space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4'>
              <div className='flex min-w-0 items-center gap-3'>
                <Avatar className='size-12 rounded-xl border'>
                  <AvatarFallback className='rounded-xl bg-primary/10 text-base font-semibold text-primary'>
                    {getInitials(user.names, user.lastnames)}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <h3 className='truncate text-base font-semibold'>
                    {user.names} {user.lastnames}
                  </h3>
                  <p className='truncate text-sm text-muted-foreground'>
                    {user.email}
                  </p>
                </div>
              </div>

              <Badge variant={isActive ? 'succes' : 'danger'} className='gap-1.5 px-2.5 py-1'>
                <span
                  className={`size-1.5 rounded-full ${
                    isActive ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {user.state}
              </Badge>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <DetailItem
                icon={<CreditCard className='size-4' />}
                label='N° Documento'
                value={user.document ? String(user.document) : '-'}
              />
              <DetailItem
                icon={<Phone className='size-4' />}
                label='N° Teléfono'
                value={user.phone ? String(user.phone) : '-'}
              />
              <DetailItem
                icon={<Mail className='size-4' />}
                label='Correo electrónico'
                value={user.email || '-'}
              />
              <DetailItem
                icon={<Building2 className='size-4' />}
                label='Empresa'
                value={formatCompany(user.company)}
              />
              <DetailItem
                icon={<Briefcase className='size-4' />}
                label='Proceso'
                value={formatEnumLabel(user.process)}
                className='capitalize'
              />
              <DetailItem
                icon={<Shield className='size-4' />}
                label='Cargo'
                value={formatEnumLabel(user.sub_process)}
                className='capitalize'
              />
              <DetailItem
                icon={<Calendar className='size-4' />}
                label='Fecha de creación'
                value={formatDate(user.createdAt)}
              />
              <DetailItem
                icon={<Clock className='size-4' />}
                label='Última actualización'
                value={formatDate(user.updatedAt)}
              />
            </div>
          </div>
        )}

        <DialogFooter className='pt-2'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cerrar
          </Button>
          {canManage && user && (
            <Button
              type='button'
              onClick={() => {
                onClose();
                onEdit(user);
              }}
            >
              <Pencil className='size-4' />
              Editar usuario
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
