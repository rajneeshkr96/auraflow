import Navbar from '@/components/marketing/Navbar'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
   <>
       <Navbar />
       <main className="pt-20">
        {children}
       </main>
   </>

  )
}

export default Layout