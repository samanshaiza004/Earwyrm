import { Elysia } from 'elysia'
import { auth } from '../../plugin/auth'
import { connection } from '../../collection/mysql'

export const userService = new Elysia().use(auth({ exclude: ['/login'] })).get('/user', async (ctx) => {
  const userInfo = ctx.userInfo // The ‘auth’ plugin has processed the situation where userInfo is not available.
  console.log(userInfo)
  return connection.user.findMany()
})
