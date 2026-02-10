'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(content: string) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // 2. Get Agent Profile (Auto-created by trigger, but good to verify)
    // We can just use user.id as agent_id since they are 1:1 mapped
    const agentId = user.id

    // Verify/Create Agent Profile if missing (for legacy users before trigger)
    const { data: agent } = await supabase.from('agents').select('id').eq('id', agentId).single()

    if (!agent) {
        const { error: createError } = await supabase.from('agents').insert({
            id: agentId,
            email: user.email,
            name: user.user_metadata?.full_name || 'Agent',
        })

        if (createError) {
            console.error('Error creating agent profile:', createError)
            throw new Error('Failed to create agent profile')
        }
    }

    // 3. Insert Message
    const { error } = await supabase.from('messages').insert({
        agent_id: agentId,
        content,
        role: 'user',
    })

    if (error) {
        console.error('Error sending message:', error)
        throw new Error('Failed to send message')
    }

    // 4. (Future) Trigger AI / Parsing Logic here
    // For now, simple echo or acknowledgment
    // We will run this asynchronously or via a queue in real production, 
    // but for MVP we can do a simple direct insertion.

    revalidatePath('/')
}

export async function getMessages() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: true })

    return data || []
}
