import './App.css'
import server from '@/lib/server'
import EmailLogin from '@components/molecules/EmailLogin'
import { User } from '@prisma/client'

function App() {
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    if (localStorage.getItem('token')) {
      server.user.get().then((res) => {
        if (res.error) {
          localStorage.removeItem('token')
          return location.reload()
        }
        setUsers(res.data || [])
      })
    }
  }, [])

  return (
    <div className="App">
      {users.map((user) => (
        <div key={user.id}>
          {user.name}----{user.email}
        </div>
      ))}
      {!localStorage.getItem('token') && <EmailLogin />}
    </div>
  )
}

export default App
