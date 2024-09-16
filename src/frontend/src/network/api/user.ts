import { request } from '@/network/axios'
import { User } from '@prisma/client'

export function getUsers(){
  return request.get<User[]>('/users')
}
