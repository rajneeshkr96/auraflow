import React from 'react'
import Sidebar from '@/components/global/sidebar'
import Infobar from '@/components/global/infobar'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Infobar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout