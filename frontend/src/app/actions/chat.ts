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
    const { data: messageData, error } = await supabase.from('messages').insert({
        agent_id: agentId,
        content,
        role: 'user',
    }).select().single()

    if (error) {
        console.error('Error sending message:', error)
        throw new Error('Failed to send message')
    }

    // 4. Parse Property Details (Async)
    // In a real app, this might be a background job. For MVP, we do it inline.
    try {
        const { parsePropertyDetails } = await import('@/lib/gemini')
        const extractedData = await parsePropertyDetails(content)

        if (extractedData && (extractedData.location || extractedData.price || extractedData.bhk)) {
            // Generate Embedding
            const { generateEmbedding } = await import('@/lib/gemini')
            const embedding = await generateEmbedding(
                `${extractedData.description || ''} ${extractedData.type} ${extractedData.bhk} in ${extractedData.location} at ${extractedData.price}`
            )

            // It looks like a property! Save it.
            const { error: propError } = await supabase.from('properties').insert({
                agent_id: agentId,
                message_id: messageData.id,
                raw_text: content,
                location: extractedData.location,
                price: extractedData.price,
                type: extractedData.type,
                bhk: extractedData.bhk,
                description: extractedData.description,
                contact_info: extractedData.contact_info,
                status: 'available',
                embedding: embedding
            })

            if (propError) {
                console.error('Error saving property:', propError)
            } else {
                // Auto-reply confirming extraction
                await supabase.from('messages').insert({
                    agent_id: agentId,
                    role: 'assistant',
                    content: `I've saved this property in **${extractedData.location}** (${extractedData.bhk}, ${extractedData.price}).`
                })
            }
        }
    } catch (parseError) {
        console.error('Parsing failed:', parseError)
    }

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
