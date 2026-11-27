import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
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

export const DialogUserEdit = ({ user, onClose, reload }: DialogUserEditProps) => {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario seleccionado y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        {user && !options ? (
          <div className='relative min-h-48'>
            <Loading />
          </div>
        ) : (
          <section>
            <form className='grid grid-cols-3 gap-4' onSubmit={handleSubmit}>
              <Label htmlFor='edit_names_'>Nombres</Label>
              <Input
                id='edit_names_'
                name='names'
                type='text'
                className='col-span-2'
                value={formData.names}
                onChange={handleChange}
                placeholder='Valeria Daniela'
              />

              <Label htmlFor='edit_lastNames_'>Apellidos</Label>
              <Input
                id='edit_lastNames_'
                name='lastNames'
                type='text'
                className='col-span-2'
                value={formData.lastNames}
                onChange={handleChange}
                placeholder='Perez Muños'
              />

              <Label htmlFor='edit_document_'>N° Documento</Label>
              <Input
                id='edit_document_'
                name='document'
                type='text'
                className='col-span-2'
                value={formData.document}
                onChange={handleChange}
                placeholder='1118245****'
              />

              <Label htmlFor='edit_phone_'>N° Telefono</Label>
              <Input
                id='edit_phone_'
                name='phone'
                type='text'
                className='col-span-2'
                value={formData.phone}
                onChange={handleChange}
                placeholder='320 245 67 ** **'
              />

              <Label htmlFor='edit_email_'>Correo</Label>
              <Input
                id='edit_email_'
                name='email'
                type='text'
                className='col-span-2'
                value={formData.email}
                onChange={handleChange}
                placeholder='example@gmail.com'
              />

              <Label htmlFor='edit_company_'>Empresa</Label>
              <select
                id='edit_company_'
                name='company'
                value={formData.company}
                onChange={handleChange}
                className='border rounded-md px-2 py-1 cursor-pointer col-span-2'
              >
                <option value=''>Seleccionar Empresa</option>
                {options?.company.map((opt) => (
                  <option value={opt.value.toString()} key={opt.value}>
                    {opt.label.replace('Y', ' ')}
                  </option>
                ))}
              </select>

              <Label htmlFor='edit_process_'>Proceso</Label>
              <select
                id='edit_process_'
                name='process'
                value={formData.process}
                onChange={handleChange}
                className='border rounded-md px-2 py-1 cursor-pointer col-span-2'
              >
                <option value=''>Seleccionar Proceso</option>
                {options?.process.map((item) => (
                  <option key={item.value} value={item.value.toString()}>
                    {item.label.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <Label htmlFor='edit_sub_process_'>Cargo</Label>
              <select
                id='edit_sub_process_'
                name='sub_process'
                value={formData.sub_process}
                onChange={handleChange}
                className='border rounded-md px-2 py-1 cursor-pointer col-span-2'
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
                    {item.label.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <div className='col-span-3 flex justify-end gap-2 pt-2'>
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
              </div>
            </form>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
};
