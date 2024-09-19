import { treaty } from '@elysiajs/eden'
import type { App } from '../../../backend'
const server = treaty<App>('localhost:8090', {
  headers: [() => ({ authorization: `Bearer ${localStorage.getItem('token')}` })],
})
export default server
