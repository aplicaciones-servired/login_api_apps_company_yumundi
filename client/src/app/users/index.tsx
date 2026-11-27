import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { DialogUserCreate } from '@/components/dialog-comp';
import { DialogUserEdit } from '@/components/dialog-edit-user';
import { DialogUserDetail } from '@/components/dialog-user-detail';
import { useAuth } from '@/hooks/useAuth';
import { formatCompany, formatEnumLabel, getInitials, normalizeText } from '@/lib/formatters';
import { canManageUsers } from '@/lib/permissions';
import { UserI } from '@/types/User';
import axios from 'axios';
import {
  EllipsisVertical,
  Eye,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users as UsersIcon,
  UserX,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type StateFilter = 'Todos' | 'Activo' | 'Inactivo';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const hasFullAccess = canManageUsers(currentUser);

  const [users, setUsers] = useState<UserI[]>([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<StateFilter>('Todos');
  const [processFilter, setProcessFilter] = useState('Todos');

  const [editingUser, setEditingUser] = useState<UserI | null>(null);
  const [detailUser, setDetailUser] = useState<UserI | null>(null);

  const handleReload = () => {
    setReload((prev) => !prev);
  };

  const handleToggleState = (id: string, currentState: string) => {
    const newState = currentState === 'Activo' ? '0' : '1';
    axios
      .post('/changestate', { id, newState })
      .then((res) => {
        if (res.status === 200) {
          handleReload();
          toast.success(
            `Usuario actualizado a estado: ${newState === '1' ? 'Activo' : 'Inactivo'}`,
            {
              description: `Documento modificado: ${res.data.document}`,
            }
          );
        }
      })
      .catch((err) => {
        if (axios.isAxiosError<{ message?: string }>(err) && err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error('No se pudo cambiar el estado del usuario');
        }
      });
  };

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
        toast.error('Error al cargar la lista de usuarios');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reload]);

  const processOptions = useMemo(() => {
    const unique = Array.from(new Set(users.map((u) => u.process).filter(Boolean)));
    return unique.sort((a, b) => formatEnumLabel(a).localeCompare(formatEnumLabel(b)));
  }, [users]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.state === 'Activo').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = normalizeText(searchTerm);

    return users.filter((u) => {
      if (stateFilter !== 'Todos' && u.state !== stateFilter) return false;
      if (processFilter !== 'Todos' && u.process !== processFilter) return false;
      if (!query) return true;

      const haystack = [
        u.names,
        u.lastnames,
        `${u.names} ${u.lastnames}`,
        u.document,
        u.email,
        formatEnumLabel(u.process),
        formatEnumLabel(u.sub_process),
      ]
        .map(normalizeText)
        .join(' ');

      return haystack.includes(query);
    });
  }, [users, searchTerm, stateFilter, processFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || stateFilter !== 'Todos' || processFilter !== 'Todos';

  const clearFilters = () => {
    setSearchTerm('');
    setStateFilter('Todos');
    setProcessFilter('Todos');
  };

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <div className='flex flex-wrap items-center gap-2.5'>
            <h2 className='text-2xl font-bold tracking-tight'>Usuarios del sistema</h2>
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
            Consulta, filtra y administra las cuentas registradas en el login unificado.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={handleReload}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {hasFullAccess && <DialogUserCreate reload={handleReload} />}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <div className='rounded-xl border bg-card p-4 shadow-xs'>
          <div className='flex items-center justify-between text-xs font-medium text-muted-foreground'>
            <span>Total usuarios</span>
            <UsersIcon className='size-4' />
          </div>
          {loading && users.length === 0 ? (
            <Skeleton className='mt-2 h-7 w-14' />
          ) : (
            <p className='mt-1.5 text-2xl font-bold tracking-tight'>{stats.total}</p>
          )}
        </div>

        <div className='rounded-xl border bg-card p-4 shadow-xs'>
          <div className='flex items-center justify-between text-xs font-medium text-muted-foreground'>
            <span>Activos</span>
            <UserCheck className='size-4 text-emerald-500' />
          </div>
          {loading && users.length === 0 ? (
            <Skeleton className='mt-2 h-7 w-14' />
          ) : (
            <p className='mt-1.5 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400'>
              {stats.active}
            </p>
          )}
        </div>

        <div className='rounded-xl border bg-card p-4 shadow-xs'>
          <div className='flex items-center justify-between text-xs font-medium text-muted-foreground'>
            <span>Inactivos</span>
            <UserX className='size-4 text-rose-500' />
          </div>
          {loading && users.length === 0 ? (
            <Skeleton className='mt-2 h-7 w-14' />
          ) : (
            <p className='mt-1.5 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400'>
              {stats.inactive}
            </p>
          )}
        </div>

        <div className='rounded-xl border bg-card p-4 shadow-xs'>
          <div className='flex items-center justify-between text-xs font-medium text-muted-foreground'>
            <span>Resultados visibles</span>
            <Search className='size-4' />
          </div>
          {loading && users.length === 0 ? (
            <Skeleton className='mt-2 h-7 w-14' />
          ) : (
            <p className='mt-1.5 text-2xl font-bold tracking-tight'>{filteredUsers.length}</p>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between'>
        <div className='relative flex-1'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Buscar por nombre, documento, correo, proceso o cargo...'
            className='pl-9'
          />
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='inline-flex items-center rounded-lg border bg-muted/40 p-1'>
            {(['Todos', 'Activo', 'Inactivo'] as const).map((status) => {
              const label =
                status === 'Todos' ? 'Todos' : status === 'Activo' ? 'Activos' : 'Inactivos';
              const isSelected = stateFilter === status;
              return (
                <button
                  key={status}
                  type='button'
                  onClick={() => setStateFilter(status)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <select
            aria-label='Filtrar por proceso'
            value={processFilter}
            onChange={(e) => setProcessFilter(e.target.value)}
            className='h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
          >
            <option value='Todos'>Todos los procesos</option>
            {processOptions.map((proc) => (
              <option key={proc} value={proc}>
                {formatEnumLabel(proc)}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button type='button' variant='ghost' size='sm' onClick={clearFilters}>
              <X className='size-4' />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      <div className='overflow-hidden rounded-xl border bg-card shadow-xs'>
        <Table>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead className='w-12 pl-4'>#</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Proceso y Cargo</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='pr-4 text-right'>Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className='pl-4'>
                    <Skeleton className='h-4 w-5' />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='size-9 rounded-full' />
                      <div className='space-y-1.5'>
                        <Skeleton className='h-4 w-36' />
                        <Skeleton className='h-3 w-44' />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1.5'>
                      <Skeleton className='h-4 w-28' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-28' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-16 rounded-md' />
                  </TableCell>
                  <TableCell className='pr-4 text-right'>
                    <Skeleton className='ml-auto h-8 w-8 rounded-md' />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center'>
                  <div className='mx-auto flex max-w-sm flex-col items-center gap-2'>
                    <div className='flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                      <UsersIcon className='size-5' />
                    </div>
                    <p className='text-sm font-medium'>
                      {hasActiveFilters
                        ? 'No se encontraron usuarios con los filtros aplicados'
                        : 'No hay usuarios registrados'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {hasActiveFilters
                        ? 'Prueba ajustando el texto de búsqueda o limpiando los filtros.'
                        : 'Cuando se registren usuarios aparecerán en esta tabla.'}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='mt-2'
                        onClick={clearFilters}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u, i) => {
                const isActive = u.state === 'Activo';

                return (
                  <TableRow key={u.id}>
                    <TableCell className='pl-4 font-mono text-xs text-muted-foreground'>
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='size-9 border'>
                          <AvatarFallback className='bg-primary/10 text-xs font-semibold text-primary'>
                            {getInitials(u.names, u.lastnames)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0'>
                          <p className='truncate font-medium leading-tight'>
                            {u.names} {u.lastnames}
                          </p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='font-mono text-xs sm:text-sm'>
                      {u.document}
                    </TableCell>
                    <TableCell>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium capitalize'>
                          {formatEnumLabel(u.process)}
                        </p>
                        <p className='truncate text-xs text-muted-foreground capitalize'>
                          {formatEnumLabel(u.sub_process)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {formatCompany(u.company)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? 'succes' : 'danger'} className='gap-1.5'>
                        <span
                          className={`size-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {u.state}
                      </Badge>
                    </TableCell>
                    <TableCell className='pr-4 text-right'>
                      {hasFullAccess ? (
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              aria-label={`Opciones de ${u.names} ${u.lastnames}`}
                            >
                              <EllipsisVertical className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onSelect={() => setDetailUser(u)}>
                              <Eye className='size-4' />
                              Ver detallado
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setEditingUser(u)}>
                              <Pencil className='size-4' />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleToggleState(u.id, u.state)}
                              className={
                                isActive
                                  ? 'text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400'
                                  : 'text-emerald-600 focus:text-emerald-600 dark:text-emerald-400 dark:focus:text-emerald-400'
                              }
                            >
                              {isActive ? (
                                <>
                                  <UserX className='size-4' />
                                  Inactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className='size-4' />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => setDetailUser(u)}
                        >
                          <Eye className='size-4' />
                          Ver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DialogUserDetail
        user={detailUser}
        onClose={() => setDetailUser(null)}
        canManage={hasFullAccess}
        onEdit={(selected) => setEditingUser(selected)}
      />

      {hasFullAccess && (
        <DialogUserEdit
          user={editingUser}
          onClose={() => setEditingUser(null)}
          reload={handleReload}
        />
      )}
    </section>
  );
}
