import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from './ModeToggle'
import { useLocation } from 'react-router'

export function SiteHeader() {
  const { pathname } = useLocation()

  const pageTitle =
    pathname === '/'
      ? 'Panel de control'
      : pathname.toLowerCase() === '/usuarios'
        ? 'Gestión de usuarios'
        : pathname.replace('/', '')

  return (
    <header className='group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-xs transition-[width,height] ease-linear'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' title='Presiona Ctrl + B' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />
        <h1 className='text-base font-semibold tracking-tight'>
          {pageTitle}
        </h1>
        <div className='ml-auto flex items-center gap-2'>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
