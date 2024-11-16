import server from '@/lib/server'

export interface UserProfile {
  id: string
  email: string
  name?: string
  bio?: string
  location?: string
  website?: string
  joinedDate: string
  avatarUrl?: string
}

class UserService {
  private baseUrl = `${import.meta.env.VITE_API_BASE_URL}/user`

  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await server.user.get()
      
      if (response.error) {
        throw new Error('Failed to fetch user profile')
      }

      const data = Array.isArray(response.data) ? response.data[0] : response.data
      return this.transformUserData(data)
    } catch (error) {
      console.error('Error fetching current user:', error)
      throw error
    }
  }

  async getUserById(userId: string): Promise<UserProfile> {
    try {
      const response = await server.user[userId].get()
      
      if (response.error) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch user profile')
      }

      const data = Array.isArray(response.data) ? response.data[0] : response.data
      return this.transformUserData(data)
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error)
      throw error
    }
  }

  private transformUserData(data: any): UserProfile {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      bio: data.bio,
      location: data.location,
      website: data.website,
      joinedDate: data.createdAt || new Date().toISOString(),
      avatarUrl: data.avatarUrl
    }
  }
}

export const userService = new UserService()
