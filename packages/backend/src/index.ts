// import { tracerFn } from './record'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { testEmail } from './routes/test-email'
import { authorityService, userService } from './services'

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    credentials: true
  }))
  .use(swagger())
  .use(authorityService)
  .use(userService)
  .use(testEmail)
  .listen(8090)

console.log('🦊 Server is running at http://localhost:8090')

export type App = typeof app
