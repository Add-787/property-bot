import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey || '')

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
})

// Define the schema for the property object
export interface ExtractedProperty {
    location?: string
    price?: string
    type?: string
    bhk?: string
    description?: string
    contact_info?: string
}

export async function parsePropertyDetails(text: string): Promise<ExtractedProperty | null> {
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set')
        return null
    }

    const prompt = `
    You are a real estate assistant. Extract the following details from the property listing text below.
    Return ONLY a valid JSON object. Do not include any other text or markdown formatting.
    
    Fields to extract:
    - location: The neighborhood or city (e.g., "Bandra", "Andheri West").
    - price: The price (e.g., "3.5 Cr", "75k").
    - type: "Sale" or "Rent".
    - bhk: The configuration (e.g., "2BHK", "3 BHK").
    - description: A short summary (max 20 words).
    - contact_info: Any phone number or name mentioned.
    
    If a field is not found, exclude it or set it to null.
    
    Text: "${text}"
  `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const textResponse = response.text()

        // Clean up potential markdown code blocks
        const jsonString = textResponse.replace(/^```json\n|\n```$/g, '').trim()

        return JSON.parse(jsonString) as ExtractedProperty
    } catch (error) {
        console.error('Error parsing property with Gemini:', error)
        return null
    }
}
