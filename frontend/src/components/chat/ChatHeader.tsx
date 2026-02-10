import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export default function ChatHeader() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-white">Property Bot</h1>
            </div>
            <div className="flex items-center space-x-4">
                {user && (
                    <div className="text-sm text-right">
                        <p className="font-medium text-gray-200">{user.email}</p>
                        <p className="text-xs text-gray-400">Agent</p>
                    </div>
                )}
                <div className="h-8 w-8 rounded-full bg-green-900 flex items-center justify-center text-green-400 font-bold border border-green-700">
                    {user?.email?.[0].toUpperCase() || 'A'}
                </div>
            </div>
        </div>
    )
}
