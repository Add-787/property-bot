'use client'

import { useState } from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Message } from './ChatBubble'
import { sendMessage } from '@/app/actions/chat'

export default function ChatWindow({ initialMessages }: { initialMessages: Message[] }) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)

    const handleSendMessage = async (content: string) => {
        // Optimistic UI update
        const tempId = Date.now().toString()
        const newMessage: Message = {
            id: tempId,
            content,
            role: 'user',
            created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, newMessage])

        try {
            await sendMessage(content)
            // We rely on revalidatePath in the server action to refresh the page/data
            // But for a smooth chat experience, we might want to fetch the real message back
            // or just leave the optimistic one until refresh.
            // For now, let's just keep the optimistic one.
        } catch (error) {
            console.error('Failed to send message:', error)
            // Rollback on error
            setMessages((prev) => prev.filter(m => m.id !== tempId))
            alert('Failed to send message')
        }
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-900 shadow-xl border-x border-gray-700">
            <ChatHeader />
            <MessageList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    )
}
