"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';

async function getAuthHeader() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('Authentication');
    if (!authCookie) return null;
    return { Cookie: `Authentication=${authCookie.value}` };
}

export async function getAutomations() {
    try {
        const headers = await getAuthHeader();
        if (!headers) return [];
        const response = await axios.get(`${AURA_API}/automations`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching automations:', error);
        return [];
    }
}

export async function getAutomationStats() {
    try {
        const headers = await getAuthHeader();
        if (!headers) return { totalAutomations: 0, activeAutomations: 0, totalTriggers: 0, totalReplies: 0 };

        // Try fetching from stats endpoint, fallback to deriving from automations
        try {
            const response = await axios.get(`${AURA_API}/automations/stats`, { headers });
            return response.data;
        } catch {
            // Fallback: compute basic stats from automations list
            const automations = await getAutomations();
            return {
                totalAutomations: automations.length,
                activeAutomations: automations.filter((a: any) => a.active).length,
                totalTriggers: automations.reduce((sum: number, a: any) => sum + (a.trigger?.length || 0), 0),
                totalReplies: 0,
            };
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { totalAutomations: 0, activeAutomations: 0, totalTriggers: 0, totalReplies: 0 };
    }
}

export async function getAutomationById(id: string) {
    try {
        const headers = await getAuthHeader();
        if (!headers) return null;
        const response = await axios.get(`${AURA_API}/automations/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error fetching automation ${id}:`, error);
        return null;
    }
}

export async function updateAutomation(id: string, data: {
    name?: string,
    active?: boolean,
    triggerTypes?: ('DM' | 'COMMENT')[],
    keywords?: string[],
    listenerType?: 'MESSAGE' | 'SMART_AI',
    reply?: string,
    dmReply?: string,
    prompt?: string,
    posts?: { postid: string, caption?: string, media?: string, mediaType?: string }[]
}) {
    try {
        const headers = await getAuthHeader();
        if (!headers) return { success: false, error: 'Unauthorized' };
        await axios.put(`${AURA_API}/automations/${id}`, data, { headers });
        revalidatePath(`/automations/${id}`);
        revalidatePath('/automations');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating automation:', error?.response?.data || error.message);
        return { success: false, error: error?.response?.data?.message || 'Failed to save' };
    }
}

export async function deleteAutomation(id: string) {
    try {
        const headers = await getAuthHeader();
        if (!headers) return { success: false, error: 'Unauthorized' };
        await axios.delete(`${AURA_API}/automations/${id}`, { headers });
        revalidatePath('/automations');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting automation:', error?.response?.data || error.message);
        return { success: false, error: 'Failed to delete automation' };
    }
}

export async function toggleAutomation(id: string, active: boolean) {
    return updateAutomation(id, { active });
}
