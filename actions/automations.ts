"use server";

import { client } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAutomation(id: string, data: {
    name?: string,
    active?: boolean,
    triggerTypes?: ('DM' | 'COMMENT')[],
    keywords?: string[],
    listenerType?: 'MESSAGE' | 'SMART_AI',
    reply?: string,
    prompt?: string,
    posts?: {
        postid: string,
        caption?: string,
        media?: string,
        mediaType?: string
    }[]
}) {
    try {
        // 1. Update basic info
        await client.automation.update({
            where: { id },
            data: {
                name: data.name,
                active: data.active
            }
        });

        // 2. Update Triggers
        if (data.triggerTypes && data.triggerTypes.length > 0) {
            await client.trigger.deleteMany({ where: { automationId: id } });
            await client.trigger.createMany({
                data: data.triggerTypes.map(type => ({
                    automationId: id,
                    type: type
                }))
            });
        }

        // 3. Update Keywords
        if (data.keywords) {
            await client.keyword.deleteMany({ where: { automationId: id } });
            if (data.keywords.length > 0) {
                await client.keyword.createMany({
                    data: data.keywords.map(k => ({
                        automationId: id,
                        word: k
                    }))
                });
            }
        }

        // 4. Update Listener
        if (data.listenerType) {
            // Check if listener exists
            const existingListener = await client.listener.findUnique({ where: { automationId: id } });

            const listenerData = {
                listener: data.listenerType,
                commentReply: data.listenerType === 'MESSAGE' ? data.reply : undefined,
                dmReply: data.listenerType === 'MESSAGE' ? data.reply : undefined,
                prompt: data.listenerType === 'SMART_AI' ? data.prompt : undefined
            };

            if (existingListener) {
                await client.listener.update({
                    where: { automationId: id },
                    data: listenerData
                });
            } else {
                await client.listener.create({
                    data: {
                        automationId: id,
                        ...listenerData
                    }
                });
            }
        }

        // 5. Update Posts
        if (data.posts) {
            await client.post.deleteMany({ where: { automationId: id } });
            if (data.posts.length > 0) {
                await client.post.createMany({
                    data: data.posts.map(p => ({
                        automationId: id,
                        postid: p.postid,
                        caption: p.caption,
                        media: p.media,
                        mediaType: p.mediaType
                    }))
                });
            }
        }

        revalidatePath(`/automations/${id}`);
        revalidatePath('/automations');
        return { success: true };
    } catch (error) {
        console.error('Error updating automation:', error);
        return { success: false, error: 'Failed to save' };
    }
}
