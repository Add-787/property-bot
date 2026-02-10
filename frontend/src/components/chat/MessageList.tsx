import ChatBubble, { Message } from './ChatBubble'
import { useEffect, useRef } from 'react'

export default function MessageList({ messages }: { messages: Message[] }) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} />
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    )
}
