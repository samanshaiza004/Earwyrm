import { useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserCircle, Mail, Calendar, MapPin, Link as LinkIcon } from 'lucide-react'
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

export function Profile() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (userId) {
          const data = await userService.getUserById(userId)
          setProfile(data)
        } else {
          const data = await userService.getCurrentUser()
          setProfile(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load profile'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'An error occurred while loading the profile'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.name || 'User'}'s avatar`}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">
                    {profile?.name || 'Anonymous User'}
                  </CardTitle>
                  <CardDescription>{profile?.email}</CardDescription>
                  {profile?.bio && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {profile.bio}
                    </p>
                  )}
                </>
              )}
            </div>
            {user?.id === profile?.id && (
              <Button variant="outline">Edit Profile</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LinkIcon className="h-4 w-4" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(profile?.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
