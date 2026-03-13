import React from 'react'
import Sidebar from '@/components/global/sidebar'
import Infobar from '@/components/global/infobar'
import { getUserProfile } from '@/actions/user'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const user = await getUserProfile()

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Infobar user={user} />
        <main className="flex-1 overflow-y-auto p-8 dot-pattern">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout