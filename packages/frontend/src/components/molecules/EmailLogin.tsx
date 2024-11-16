import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import server from '@/lib/server'
import { useToast } from '@hooks/use-toast'
import { useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from '@/lib/utils'

export const description = "A simple login form with email and password. The submit button says 'Sign in'."

export function EmailLogin() {
  const [isVerificationCodeMode, setIsVerificationCodeMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const verificationCodeInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const getAllFormValues = () => {
    const email = emailInputRef.current?.value
    const verificationCode = verificationCodeInputRef.current?.value
    return { email, verificationCode }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const startCountdown = () => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const onGetVerificationCode = async () => {
    const { email } = getAllFormValues()
    setError(null)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setIsLoading(true)
      const { error } = await server.authority.get_verification_code.post({ email })
      
      if (!error) {
        toast({
          title: 'Success',
          description: 'Verification code sent! Please check your email.',
          variant: 'default',
        })
        setIsVerificationCodeMode(false)
        startCountdown()
      } else {
        setError(String(error.value) || 'Failed to send verification code')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async () => {
    const { email, verificationCode } = getAllFormValues()
    setIsLoading(true)
    setError(null)

    try {
      if (!email || !verificationCode) {
        setError('Please enter your email and verification code')
        return
      }
      console.log('[Login] Attempting login with email:', email);
      const response = await server.authority.login.post({ email, verificationCode })
      console.log('[Login] Full response:', response);
      
      if (response.error) {
        const errorString = response.error instanceof Error ? response.error.message : String(response.error)
        console.error('[Login] Login failed:', errorString);
        setError(errorString)
      } else if (response.data?.success && response.data?.data?.token) {
        // The token is nested in response.data.data.token
        const token = response.data.data.token;
        console.log('[Login] Token found in response');
        localStorage.setItem('token', token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('[Login] Token stored in localStorage:', !!storedToken);
        
        // Redirect to home page
        window.location.href = '/'
      } else {
        console.error('[Login] Unexpected response structure:', response);
        setError('Authentication failed: Invalid response format')
      }
    } catch (err) {
      const errorString = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      console.error('[Login] Login error:', errorString);
      setError(errorString)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <img src="https://elysiajs.com/assets/elysia.svg" alt="elysia" className="w-8 h-8" />
          <span>Welcome to Earwyrm</span>
        </CardTitle>
        <CardDescription>
          {isVerificationCodeMode
            ? 'Enter your email to receive a verification code.'
            : 'Enter the verification code sent to your email.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            ref={emailInputRef}
            disabled={isLoading || (!isVerificationCodeMode && countdown > 0)}
            className={cn(
              !isVerificationCodeMode && "opacity-50"
            )}
          />
        </div>
        {!isVerificationCodeMode && (
          <div className="grid gap-2">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input 
              id="verificationCode" 
              type="text" 
              required 
              ref={verificationCodeInputRef}
              disabled={isLoading}
              placeholder="Enter the 6-digit code"
              maxLength={6}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={isVerificationCodeMode ? onGetVerificationCode : onSubmit}
          disabled={isLoading || (isVerificationCodeMode && countdown > 0)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isVerificationCodeMode ? 'Sending Code...' : 'Signing In...'}
            </>
          ) : isVerificationCodeMode ? (
            'Get Verification Code'
          ) : (
            'Sign In'
          )}
        </Button>
        {!isVerificationCodeMode && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setIsVerificationCodeMode(true)}
            disabled={countdown > 0}
          >
            {countdown > 0 ? (
              `Request new code in ${countdown}s`
            ) : (
              'Request New Code'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
