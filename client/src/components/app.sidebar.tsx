import { LayoutDashboardIcon, ShieldCheck, UsersIcon } from 'lucide-react'
import { ComponentProps } from 'react'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Usuarios',
      url: '/Usuarios',
      icon: UsersIcon,
    }
  ]
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className='flex items-center gap-3 px-2 py-1.5'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs'>
                <ShieldCheck className='size-4' />
              </div>
              <div className='grid text-left leading-tight'>
                <span className='truncate text-sm font-semibold'>Gane Multired · Servired</span>
                <span className='truncate text-xs text-muted-foreground'>Gestión de accesos</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
