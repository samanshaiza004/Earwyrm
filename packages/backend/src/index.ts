// import { tracerFn } from './record'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'

import { authorityService, userService } from './services'

const app = new Elysia()
  .use(cors({ origin: process.env.FRONTEND_PROJECT_URL! }))
  .use(swagger())
  .use(authorityService)
  .use(userService)

app.listen(8090)

export type App = typeof app
