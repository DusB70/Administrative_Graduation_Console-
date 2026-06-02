import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // This will query the 'todos' table you create in Supabase
  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    return (
      <div className="p-8 text-red-500 font-bold">
        Error fetching todos: {error.message}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Supabase Test Page</h1>
      <p className="text-sm text-slate-500">Fetched from `todos` table:</p>
      {todos && todos.length > 0 ? (
        <ul className="list-disc pl-5">
          {todos.map((todo: any) => (
            <li key={todo.id} className="text-slate-800">{todo.name}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400 italic">No todos found or table is empty.</p>
      )}
    </div>
  )
}
