import React from 'react'
import Sidebar from '@/components/global/sidebar'
import Infobar from '@/components/global/infobar'
import { getUserProfile } from '@/actions/user'
import MobileShell from '@/components/global/mobile-shell'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const user = await getUserProfile()

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex">
        <Sidebar user={user} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile shell wraps infobar + drawer sidebar */}
        <MobileShell user={user} />

        {/* Desktop infobar — hidden on mobile */}
        <div className="hidden lg:flex">
          <Infobar user={user} />
        </div>

        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 lg:p-10 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout