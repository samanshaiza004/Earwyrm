import { Elysia, t } from 'elysia'
// import { tracerFn } from './record'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { authorityService, userService } from './services'

const app = new Elysia()
  .use(cors({ origin: 'localhost:5173' }))
  .use(swagger())
  .use(authorityService)
  .use(userService)

app.listen(8090)

export type App = typeof app
