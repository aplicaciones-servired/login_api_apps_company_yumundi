import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { formatCompany, formatEnumLabel } from '@/lib/formatters';
import { OptionsCreation } from '@/types/Interfaces';
import { UserI } from '@/types/User';
import axios from 'axios';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DialogUserEditProps {
  user: UserI | null;
  onClose: () => void;
  reload: () => void;
}

interface EditUserFormState {
  names: string;
  lastNames: string;
  document: string;
  phone: string;
  email: string;
  company: string;
  process: string;
  sub_process: string;
}

const initialFormState: EditUserFormState = {
  names: '',
  lastNames: '',
  document: '',
  phone: '',
  email: '',
  company: '',
  process: '',
  sub_process: '',
};

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

export const DialogUserEdit = ({ user, onClose, reload }: DialogUserEditProps) => {
  const { user: currentUser, login } = useAuth();
  const [options, setOptions] = useState<OptionsCreation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EditUserFormState>(initialFormState);

  useEffect(() => {
    if (!user || options) return;

    axios
      .get<OptionsCreation>('/newUserOptions')
      .then((res) => setOptions(res.data))
      .catch((err) => {
        console.error(err);
        toast.error('No se pudieron cargar las opciones del formulario');
      });
  }, [user, options]);

  useEffect(() => {
    if (!user) {
      setFormData(initialFormState);
      return;
    }
    if (!options) return;

    const companyValue =
      options.company.find((opt) => opt.label === user.company)?.value.toString() ?? '';
    const processValue =
      options.process.find((opt) => opt.label === user.process)?.value.toString() ?? '';
    const subProcessValue =
      options.sub_process.find((opt) => opt.label === user.sub_process)?.value.toString() ?? '';

    setFormData({
      names: user.names ?? '',
      lastNames: user.lastnames ?? '',
      document: user.document?.toString() ?? '',
      phone: user.phone?.toString() ?? '',
      email: user.email ?? '',
      company: companyValue,
      process: processValue,
      sub_process: subProcessValue,
    });
  }, [user, options]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const res = await axios.put(`/user/${user.id}`, formData);
      if (res.status === 200) {
        if (currentUser?.id === user.id) {
          await login();
        }
        onClose();
        reload();
        toast.success('Usuario actualizado correctamente', {
          description: `${formData.names} ${formData.lastNames}`,
        });
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError<{ message?: string }>(err)) {
        toast.error(err.response?.data?.message || 'Error al actualizar el usuario');
      } else {
        toast.error('Error al actualizar el usuario');
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
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario seleccionado y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        {user && !options ? (
          <div className='relative min-h-56'>
            <Loading />
          </div>
        ) : (
          <form className='grid grid-cols-1 gap-4 sm:grid-cols-2' onSubmit={handleSubmit}>
            <div className='space-y-1.5'>
              <Label htmlFor='edit_names_'>Nombres</Label>
              <Input
                id='edit_names_'
                name='names'
                type='text'
                value={formData.names}
                onChange={handleChange}
                placeholder='Valeria Daniela'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit_lastNames_'>Apellidos</Label>
              <Input
                id='edit_lastNames_'
                name='lastNames'
                type='text'
                value={formData.lastNames}
                onChange={handleChange}
                placeholder='Perez Muños'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit_document_'>N° Documento</Label>
              <Input
                id='edit_document_'
                name='document'
                type='text'
                value={formData.document}
                onChange={handleChange}
                placeholder='1118245****'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit_phone_'>N° Teléfono</Label>
              <Input
                id='edit_phone_'
                name='phone'
                type='text'
                value={formData.phone}
                onChange={handleChange}
                placeholder='320 245 67**'
              />
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='edit_email_'>Correo electrónico</Label>
              <Input
                id='edit_email_'
                name='email'
                type='text'
                value={formData.email}
                onChange={handleChange}
                placeholder='usuario@empresa.com'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit_company_'>Empresa</Label>
              <select
                id='edit_company_'
                name='company'
                value={formData.company}
                onChange={handleChange}
                className={selectClassName}
              >
                <option value=''>Seleccionar Empresa</option>
                {options?.company.map((opt) => (
                  <option value={opt.value.toString()} key={opt.value}>
                    {formatCompany(opt.label)}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit_process_'>Proceso</Label>
              <select
                id='edit_process_'
                name='process'
                value={formData.process}
                onChange={handleChange}
                className={selectClassName}
              >
                <option value=''>Seleccionar Proceso</option>
                {options?.process.map((item) => (
                  <option key={item.value} value={item.value.toString()}>
                    {formatEnumLabel(item.label)}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='edit_sub_process_'>Cargo</Label>
              <select
                id='edit_sub_process_'
                name='sub_process'
                value={formData.sub_process}
                onChange={handleChange}
                className={`${selectClassName} capitalize`}
              >
                <option value=''>Seleccionar Cargo</option>
                {options?.sub_process.map((item) => (
                  <option
                    key={item.value}
                    value={item.value.toString()}
                    disabled={
                      item.label === 'Director_Tecnologia' &&
                      user?.sub_process !== 'Director_Tecnologia'
                    }
                    className='capitalize'
                  >
                    {formatEnumLabel(item.label)}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className='pt-2 sm:col-span-2'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
