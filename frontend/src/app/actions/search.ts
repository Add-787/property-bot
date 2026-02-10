'use server'

import { createClient } from '@/utils/supabase/server'
import { generateEmbedding } from '@/lib/gemini'

export interface SearchResult {
    id: string
    location: string
    price: string
    bhk: string
    type: string
    description: string
    similarity: number
}

export async function searchProperties(query: string): Promise<SearchResult[]> {
    const supabase = await createClient()

    // 1. Generate text embedding for the search query
    const embedding = await generateEmbedding(query)

    if (!embedding) {
        console.error('Failed to generate embedding for query')
        return []
    }

    // 2. Perform vector similarity search via Supabase RPC
    // Note: We need to create this RPC function in the database first!
    const { data, error } = await supabase.rpc('match_properties', {
        query_embedding: embedding,
        match_threshold: 0.5, // adjust this threshold (0-1)
        match_count: 5
    })

    if (error) {
        console.error('Error searching properties:', error)
        return []
    }

    return data as SearchResult[]
}
