'use client'

import { useState } from 'react'

export default function MessageInput({ onSendMessage }: { onSendMessage: (content: string) => Promise<void> }) {
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || isLoading) return

        setIsLoading(true)
        try {
            await onSendMessage(message)
            setMessage('')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message or paste a property listing..."
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900"
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    )
}
