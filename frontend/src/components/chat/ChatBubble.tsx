export type Message = {
    id: string
    content: string
    role: 'user' | 'assistant'
    created_at: string
}

export default function ChatBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user'

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${isUser
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
                    }`}
            >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <div
                    className={`text-xs mt-1 ${isUser ? 'text-green-200' : 'text-gray-500'}`}
                >
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    )
}
