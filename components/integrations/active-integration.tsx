'use client'

import React, { useState } from 'react'
import { onDisconnectIntegration } from '@/actions/integrations'
import { CheckCircle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {
    id: string
    name: string
    detail: string
    type: 'INSTAGRAM'
}

const ActiveIntegration = ({ id, name, detail, type }: Props) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDisconnect = async () => {
        setLoading(true)
        try {
            const res = await onDisconnectIntegration(id)
            if (res.status === 200) {
                toast.success(res.message)
                router.refresh()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex bg-white border border-blue-500/20 rounded-xl p-5 gap-4 items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                {/* We can pass icon as prop or decide based on type, for now assuming parent handles icon or we just show text */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800">{name}</h3>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle size={12} /> Connected
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate max-w-[200px]">{detail}</p>
                </div>
            </div>

            <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-slate-200"
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <X className="w-4 h-4" />}
                Disconnect
            </button>
        </div>
    )
}

export default ActiveIntegration
