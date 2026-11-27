import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { Eye, EyeOff, LockIcon, ShieldCheck, UserIcon } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setLoading(true);

    toast.promise(axios.post('/login', { username, password }), {
      loading: 'Iniciando sesión...',
      success: (data) => {
        if (data.status === 200) {
          login();
          return 'Bienvenido de nuevo!';
        }
        throw new Error('Error inesperado');
      },
      error: (err) => {
        console.error(err);
        if (axios.isAxiosError<{ message?: string }>(err) && err.response?.data?.message) {
          return err.response.data.message;
        }
        return 'Error al iniciar sesión. Verifica tus credenciales.';
      },
      finally: () => {
        setLoading(false);
      },
    });
  };

  return (
    <main className='grid min-h-screen w-full bg-background text-foreground lg:grid-cols-2'>
      <section className='relative hidden flex-col justify-between overflow-hidden border-r bg-muted/30 p-10 lg:flex'>
        <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_60%,transparent_100%)]' />

        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs'>
            <ShieldCheck className='size-5' />
          </div>
          <div>
            <p className='text-sm font-semibold'>Gane Multired · Servired</p>
            <p className='text-xs text-muted-foreground'>Portal de acceso unificado</p>
          </div>
        </div>

        <div className='mx-auto flex max-w-md flex-col items-center gap-6 text-center'>
          <img
            src='userimage.png'
            alt='Ilustración gestión de usuarios'
            className='max-h-72 w-auto object-contain drop-shadow-md'
            loading='lazy'
          />
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Administración centralizada de usuarios
            </h1>
            <p className='text-sm text-muted-foreground'>
              Gestiona credenciales, procesos y estados de acceso de las aplicaciones de la compañía desde un solo lugar.
            </p>
          </div>
        </div>

        <p className='text-xs text-muted-foreground'>
          Acceso seguro mediante autenticación centralizada.
        </p>
      </section>

      <section className='flex items-center justify-center p-6 sm:p-10'>
        <div className='w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8'>
          <div className='mb-8 flex flex-col items-center gap-3 text-center'>
            <img
              src='logogane.webp'
              alt='Logo Gane'
              className='h-14 w-auto object-contain'
              loading='lazy'
            />
            <div className='space-y-1'>
              <h2 className='text-xl font-semibold tracking-tight'>Iniciar sesión</h2>
              <p className='text-sm text-muted-foreground'>
                Ingresa tu usuario y contraseña para continuar
              </p>
            </div>
          </div>

          <form className='space-y-5' onSubmit={handleSubmit}>
            <div className='space-y-2'>
              <Label htmlFor='login_username'>Usuario</Label>
              <div className='relative'>
                <UserIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='login_username'
                  name='username'
                  type='text'
                  placeholder='CP1118342523'
                  required
                  autoComplete='username'
                  className='pl-9'
                  value={username}
                  onChange={(ev) => setUsername(ev.target.value)}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='login_password'>Contraseña</Label>
              <div className='relative'>
                <LockIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='login_password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='•••••••••••'
                  required
                  autoComplete='current-password'
                  className='pr-10 pl-9'
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className='absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground'
                >
                  {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                </button>
              </div>
            </div>

            <Button disabled={loading} type='submit' className='w-full'>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className='mt-6 border-t pt-4 text-center'>
            <a
              href='https://admin-users.aplicacionesgane.cloud/reset-password'
              className='text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
