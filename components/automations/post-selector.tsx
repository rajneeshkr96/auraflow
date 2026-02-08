'use client'

import { getInstagramPosts } from '@/actions/instagram'
import { Loader2, CheckCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

type Post = {
    id: string
    caption: string
    media_url: string
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
    timestamp: string
    thumbnail_url?: string
    permalink: string
}

type Props = {
    onSelect: ({ postid, media, mediaType, caption }: { postid: string, media: string, mediaType: string, caption: string }) => void
    posts?: {
        postid: string
        media?: string
        mediaType?: string
        caption?: string
    }[]
}

const PostSelector = ({ onSelect, posts: selectedPosts = [] }: Props) => {
    const [loading, setLoading] = useState(false)
    const [posts, setPosts] = useState<Post[]>([])

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            const res = await getInstagramPosts()
            if (res.status === 200) {
                setPosts(res.data)
            }
            setLoading(false)
        }
        fetchPosts()
    }, [])

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
    }

    if (posts.length === 0) {
        return <div className="text-center p-10 text-slate-500">No posts found or Instagram integration missing.</div>
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-2 border rounded-xl">
            {posts.map((post) => {
                const isSelected = selectedPosts.some(p => p.postid === post.id)
                const mediaSrc = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url

                return (
                    <div
                        key={post.id}
                        onClick={() => onSelect({
                            postid: post.id,
                            media: post.media_url,
                            mediaType: post.media_type,
                            caption: post.caption
                        })}
                        className={clsx(
                            "relative aspect-square bg-slate-100 rounded-lg cursor-pointer overflow-hidden border-2 transition-all group",
                            isSelected ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2" : "border-transparent hover:border-blue-300"
                        )}
                    >
                        {mediaSrc ? (
                            <img src={mediaSrc} alt="Post" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
                        )}

                        {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                <CheckCircle className="text-white w-8 h-8 drop-shadow-md" />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default PostSelector
