import ChatWindow from '@/components/chat/ChatWindow'
import { getMessages } from '@/app/actions/chat'

export default async function Home() {
  const messages = await getMessages()

  // Convert Supabase dates to string if needed, or ensure they match Message type
  // getMessages returns proper objects but let's cast for safety in this demo
  const formattedMessages: any[] = messages.map(msg => ({
    ...msg,
    created_at: msg.created_at, // Ensure string format
  }))

  return (
    <main className="min-h-screen bg-gray-900 p-0 sm:p-4">
      <ChatWindow initialMessages={formattedMessages} />
    </main>
  )
}
