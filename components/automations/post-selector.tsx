"use client";

import { useState, useEffect } from 'react';
import { getInstagramPosts } from '@/actions/instagram';
import { ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Post {
    postid: string;
    caption?: string;
    media?: string;
    mediaType?: string;
}

interface Props {
    onSelect: (post: Post) => void;
    posts: Post[];
}

export default function PostSelector({ onSelect, posts = [] }: Props) {
    const [availablePosts, setAvailablePosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const fetchPosts = async () => {
        if (fetched) return;
        setLoading(true);
        try {
            const result = await getInstagramPosts();
            if (result.status === 200 && Array.isArray(result.data)) {
                setAvailablePosts(result.data.slice(0, 12));
            }
        } catch (e) {
            console.error('Error fetching posts:', e);
        }
        setLoading(false);
        setFetched(true);
    };

    useEffect(() => { fetchPosts(); }, []);

    const isSelected = (postid: string) => posts.some(p => p.postid === postid);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading posts...</span>
            </div>
        );
    }

    if (availablePosts.length === 0) {
        return (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-400">
                <ImageIcon className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">No posts found. Connect Instagram to select specific posts.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            {availablePosts.map((post) => {
                const selected = isSelected(post.postid);
                return (
                    <button
                        key={post.postid}
                        onClick={() => onSelect(post)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selected ? 'border-violet-600' : 'border-transparent hover:border-slate-300'
                        }`}
                    >
                        {post.media ? (
                            <Image src={post.media} alt={post.caption || 'Post'} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                            </div>
                        )}
                        {selected && (
                            <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-white drop-shadow-lg" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
