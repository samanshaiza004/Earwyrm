import { treaty } from '@elysiajs/eden'
import type { App } from 'bun-api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  console.log('[Server] Getting auth header, token exists:', !!token)
  return token ? { authorization: `Bearer ${token}` } : undefined
}

const server = treaty<App>(import.meta.env.VITE_API_BASE_URL, {
  headers: [getAuthHeader],
})

export default server
