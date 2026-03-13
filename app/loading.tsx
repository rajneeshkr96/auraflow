import React from 'react'

const Loading = () => {
  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-slate-200/60 rounded-xl animate-shimmer" />
        <div className="h-4 w-80 bg-slate-100/80 rounded-lg animate-shimmer" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl animate-shimmer" />
            <div className="h-8 w-16 bg-slate-100 rounded-lg animate-shimmer" />
            <div className="h-3 w-24 bg-slate-50 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-100 rounded-lg animate-shimmer" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 bg-slate-100 rounded-xl animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-100 rounded-lg animate-shimmer" />
                <div className="h-3 w-20 bg-slate-50 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 space-y-3">
          <div className="h-5 w-32 bg-white/10 rounded-lg animate-shimmer" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-white/5 rounded animate-shimmer" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Loading