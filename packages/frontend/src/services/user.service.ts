import server from '@/lib/server'

export interface UserProfile {
  id: number
  email: string
  username: string
  name?: string
  profile?: {
    bio?: string
    avatarUrl?: string
    websiteUrl?: string
    location?: string
  }
  _count?: {
    followers: number
    following: number
    posts: number
  }
}

class UserService {
  private baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`

  async getCurrentUser(): Promise<UserProfile> {
    const username = localStorage.getItem('username');
    if (!username) {
      throw new Error('No user logged in');
    }
    return this.getUserByUsername(username);
  }

  async getUserByUsername(username: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error);
      throw error;
    }
  }

  async updateProfile(username: string, profileData: Partial<UserProfile['profile']>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${username}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export const userService = new UserService()
