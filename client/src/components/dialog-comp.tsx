import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { lazy, Suspense, useState } from 'react';
import { UserPlus } from 'lucide-react';

const LazyDialogContent = lazy(() => import('@/components/dialog-content'));

export const DialogUserCreate = ({ reload }: { reload: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (openDialog: boolean) => {
    setIsOpen(openDialog)
  }

  return (
    <Dialog onOpenChange={v => handleOpenChange(v)} open={isOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className='size-4' />
          Crear Usuario
        </Button>
      </DialogTrigger>
      {isOpen && (
        <Suspense fallback={<Loading />}>
          <LazyDialogContent funClose={handleOpenChange} reload={reload}/>
        </Suspense>
      )}
    </Dialog>
  );
};