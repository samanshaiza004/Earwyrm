import { useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserCircle, Mail, Calendar, MapPin, Link as LinkIcon, Edit } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { userService, type UserProfile } from '@/services/user.service'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function Profile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const isOwnProfile = currentUser?.username === username || !username

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (isOwnProfile) {
          const data = await userService.getCurrentUser()
          setProfile(data)
        } else if (username) {
          const data = await userService.getUserByUsername(username)
          setProfile(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load profile'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [username, isOwnProfile])

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading || !profile) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {profile.profile?.avatarUrl ? (
                <img 
                  src={profile.profile.avatarUrl} 
                  alt={profile.username} 
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <UserCircle className="w-12 h-12" />
              )}
              <span>{profile.name || profile.username}</span>
            </CardTitle>
            <CardDescription>@{profile.username}</CardDescription>
          </div>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.profile?.bio && (
            <p className="text-muted-foreground">{profile.profile.bio}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {profile.email}
            </div>
            {profile.profile?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.profile.location}
              </div>
            )}
            {profile.profile?.websiteUrl && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a 
                  href={profile.profile.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {profile.profile.websiteUrl}
                </a>
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4 border-t">
            <div>
              <span className="font-medium">{profile._count?.posts || 0}</span>
              <span className="text-muted-foreground ml-1">Posts</span>
            </div>
            <div>
              <span className="font-medium">{profile._count?.followers || 0}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
            <div>
              <span className="font-medium">{profile._count?.following || 0}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
