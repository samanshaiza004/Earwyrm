import { Context } from 'elysia'

export interface ApiRes {
  data: any
  message?: string
}
export interface ApiItem {
  method: 'get' | 'delete' | 'post' | 'put' | 'head' | 'options' | 'patch' | 'all'
  path: string
  fn: (ctx: Context) => Promise<ApiRes>
}
