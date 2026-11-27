import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { formatCompany, formatEnumLabel, getInitials } from '@/lib/formatters';
import { canManageUsers } from '@/lib/permissions';
import { UserI } from '@/types/User';
import axios from 'axios';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Eye,
  Layers,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

export default function Dashboard() {
  const { user } = useAuth();
  const hasFullAccess = canManageUsers(user);

  const [users, setUsers] = useState<UserI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    axios
      .get<UserI[]>('/users')
      .then((res) => {
        if (!active) return;
        setUsers(res.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.state === 'Activo').length;
    const inactive = total - active;
    const processes = new Set(users.map((u) => u.process).filter(Boolean)).size;
    return { total, active, inactive, processes };
  }, [users]);

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6'>
      <div className='relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-xs'>
        <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-start gap-4'>
            <Avatar className='size-14 rounded-2xl border shadow-xs'>
              <AvatarFallback className='rounded-2xl bg-primary text-lg font-bold text-primary-foreground'>
                {getInitials(user?.names, user?.lastnames)}
              </AvatarFallback>
            </Avatar>

            <div className='space-y-1.5'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-2xl font-bold tracking-tight'>
                  Hola, {user?.names} {user?.lastnames}
                </h2>
                {hasFullAccess ? (
                  <Badge variant='succes' className='gap-1'>
                    <ShieldCheck className='size-3.5' />
                    Acceso completo
                  </Badge>
                ) : (
                  <Badge variant='secondary' className='gap-1'>
                    <Eye className='size-3.5' />
                    Solo lectura
                  </Badge>
                )}
              </div>

              <p className='text-sm text-muted-foreground'>
                Bienvenido al panel de administración del sistema de login unificado.
              </p>

              <div className='flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground'>
                <span className='inline-flex items-center gap-1.5 rounded-md border bg-background/80 px-2.5 py-1'>
                  <Building2 className='size-3.5' />
                  {formatCompany(user?.company)}
                </span>
                <span className='inline-flex items-center gap-1.5 rounded-md border bg-background/80 px-2.5 py-1 capitalize'>
                  <Briefcase className='size-3.5' />
                  {formatEnumLabel(user?.process)}
                </span>
                <span className='inline-flex items-center gap-1.5 rounded-md border bg-background/80 px-2.5 py-1 capitalize'>
                  <ShieldCheck className='size-3.5' />
                  {formatEnumLabel(user?.sub_process)}
                </span>
              </div>
            </div>
          </div>

          <Button asChild className='self-start md:self-center'>
            <Link to='/Usuarios'>
              Ir a Usuarios
              <ArrowRight className='size-4' />
            </Link>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-xl border bg-card p-5 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-muted-foreground'>Total usuarios</span>
            <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Users className='size-4' />
            </div>
          </div>
          {loading ? (
            <Skeleton className='mt-3 h-8 w-16' />
          ) : (
            <p className='mt-2 text-3xl font-bold tracking-tight'>{metrics.total}</p>
          )}
          <p className='mt-1 text-xs text-muted-foreground'>Cuentas registradas en la plataforma</p>
        </div>

        <div className='rounded-xl border bg-card p-5 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-muted-foreground'>Usuarios activos</span>
            <div className='flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'>
              <UserCheck className='size-4' />
            </div>
          </div>
          {loading ? (
            <Skeleton className='mt-3 h-8 w-16' />
          ) : (
            <p className='mt-2 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400'>
              {metrics.active}
            </p>
          )}
          <p className='mt-1 text-xs text-muted-foreground'>Con acceso habilitado actualmente</p>
        </div>

        <div className='rounded-xl border bg-card p-5 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-muted-foreground'>Usuarios inactivos</span>
            <div className='flex size-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400'>
              <UserX className='size-4' />
            </div>
          </div>
          {loading ? (
            <Skeleton className='mt-3 h-8 w-16' />
          ) : (
            <p className='mt-2 text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400'>
              {metrics.inactive}
            </p>
          )}
          <p className='mt-1 text-xs text-muted-foreground'>Cuentas suspendidas temporalmente</p>
        </div>

        <div className='rounded-xl border bg-card p-5 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-muted-foreground'>Procesos activos</span>
            <div className='flex size-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400'>
              <Layers className='size-4' />
            </div>
          </div>
          {loading ? (
            <Skeleton className='mt-3 h-8 w-16' />
          ) : (
            <p className='mt-2 text-3xl font-bold tracking-tight'>{metrics.processes}</p>
          )}
          <p className='mt-1 text-xs text-muted-foreground'>Áreas representadas en el directorio</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <div className='flex flex-col justify-between gap-4 rounded-xl border bg-card p-6 shadow-xs'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm font-semibold'>
              <Users className='size-4 text-primary' />
              Directorio y gestión de usuarios
            </div>
            <p className='text-sm text-muted-foreground'>
              {hasFullAccess
                ? 'Tienes permisos completos para crear nuevos usuarios, editar su información organizacional y activar o inactivar accesos.'
                : 'Puedes consultar la lista de usuarios registrados, filtrar por proceso o estado y revisar el detalle completo de cada cuenta.'}
            </p>
          </div>
          <div>
            <Button asChild variant='outline'>
              <Link to='/Usuarios'>
                Administrar usuarios
                <ArrowRight className='size-4' />
              </Link>
            </Button>
          </div>
        </div>

        <div className='flex flex-col justify-between gap-4 rounded-xl border bg-card p-6 shadow-xs'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm font-semibold'>
              <ShieldCheck className='size-4 text-primary' />
              Regla de permisos vigente
            </div>
            <p className='text-sm text-muted-foreground'>
              La creación, edición y cambio de estado de cuentas está reservada exclusivamente para el proceso{' '}
              <span className='font-medium text-foreground'>Desarrollo Informático</span> y el cargo{' '}
              <span className='font-medium text-foreground'>Director Tecnología</span>.
            </p>
          </div>
          <div className='text-xs text-muted-foreground'>
            Tu nivel actual:{' '}
            <span className='font-semibold text-foreground'>
              {hasFullAccess ? 'Acceso completo de administración' : 'Consulta (solo lectura)'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
