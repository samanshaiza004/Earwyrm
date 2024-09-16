import { request } from '@/network/axios'

interface GetTokenParams {
  randomCode: string
  email: string
}

interface GetTokenResponse {
  data: string
  message: string
}

export function getToken(params: GetTokenParams) {
  return request.post<GetTokenResponse>('/authority/login', params)
}
