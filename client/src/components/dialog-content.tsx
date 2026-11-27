import {
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
import { formatCompany, formatEnumLabel } from '@/lib/formatters';
import { OptionsCreation } from '@/types/Interfaces';
import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

function LazyDialogContent({
  funClose,
  reload,
}: {
  funClose: (openDialog: boolean) => void;
  reload: () => void;
}) {
  const [options, setOptions] = useState<OptionsCreation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new window.FormData(e.currentTarget));

    setSubmitting(true);
    try {
      await axios.post('/register', formData);
      funClose(false);
      reload();
      toast.success('Usuario creado correctamente', {
        description: 'Agregado a la lista de usuarios registrados',
      });
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError<{ message?: string }>(err) && err.response?.status === 400) {
        toast.error(err.response.data?.message || 'Error al crear usuario');
      } else {
        toast.error('Error inesperado al crear usuario');
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    axios
      .get<OptionsCreation>('/newUserOptions')
      .then((res) => setOptions(res.data))
      .catch((err) => {
        console.error(err);
        toast.error('No se pudieron cargar las opciones del formulario');
      });
  }, []);

  return (
    <DialogContent className='sm:max-w-xl'>
      <DialogHeader>
        <DialogTitle>Crear nuevo usuario</DialogTitle>
        <DialogDescription>
          Diligencia todos los campos para registrar un nuevo usuario en el sistema.
        </DialogDescription>
      </DialogHeader>

      {!options ? (
        <div className='relative min-h-56'>
          <Loading />
        </div>
      ) : (
        <form className='grid grid-cols-1 gap-4 sm:grid-cols-2' onSubmit={handleSubmit}>
          <div className='space-y-1.5'>
            <Label htmlFor='names_'>Nombres</Label>
            <Input
              id='names_'
              name='names'
              type='text'
              placeholder='Valeria Daniela'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='lastNames_'>Apellidos</Label>
            <Input
              id='lastNames_'
              name='lastNames'
              type='text'
              placeholder='Perez Muños'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='document_'>N° Documento</Label>
            <Input
              id='document_'
              type='text'
              name='document'
              placeholder='1118245****'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='phone_'>N° Teléfono</Label>
            <Input
              id='phone_'
              type='text'
              name='phone'
              placeholder='320 245 67**'
            />
          </div>

          <div className='space-y-1.5 sm:col-span-2'>
            <Label htmlFor='email_'>Correo electrónico</Label>
            <Input
              id='email_'
              type='text'
              name='email'
              placeholder='usuario@empresa.com'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='company_'>Empresa</Label>
            <select
              id='company_'
              name='company'
              className={selectClassName}
              defaultValue=''
            >
              <option value=''>Seleccionar Empresa</option>
              {options.company.map((opt) => (
                <option value={opt.value.toString()} key={opt.value}>
                  {formatCompany(opt.label)}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='process_'>Proceso</Label>
            <select
              id='process_'
              name='process'
              className={selectClassName}
              defaultValue=''
            >
              <option value=''>Seleccionar Proceso</option>
              {options.process.map((item) => (
                <option key={item.value} value={item.value.toString()}>
                  {formatEnumLabel(item.label)}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-1.5 sm:col-span-2'>
            <Label htmlFor='sub_process_'>Cargo</Label>
            <select
              id='sub_process_'
              name='sub_process'
              className={`${selectClassName} capitalize`}
              defaultValue=''
            >
              <option value=''>Seleccionar Cargo</option>
              {options.sub_process.map((item) => (
                <option
                  key={item.value}
                  value={item.value.toString()}
                  disabled={item.label === 'Director_Tecnologia'}
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
              onClick={() => funClose(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  );
}

export default LazyDialogContent;
