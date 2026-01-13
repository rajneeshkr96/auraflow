import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}

export default Loading