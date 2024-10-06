import { Button, Input } from '@components/ui'

import server from '@/lib/server'

const EmailLogin = () => {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isRequestingCode, setIsRequestingCode] = useState(true)

  const requestVerificationCode = useCallback(async () => {
    await server.authority.get_verification_code.post({ email })
    console.log(`A verification code has been sent to your email: ${email}`)
    setIsRequestingCode(false)
  }, [email])

  const login = useCallback(async () => {
    if (verificationCode) {
      const { data, error } = await server.authority.login.post({ email: email, randomCode: verificationCode })
      if (!error) {
        localStorage.setItem('token', data)
        console.log('Login successful!')
        location.reload()
        return
      } else {
        console.log(`Login failed with the error message is ${error.value}.`)
      }
    } else {
      console.log('Please enter a verification code!')
    }
  }, [verificationCode, email])

  return (
    <div>
      {isRequestingCode ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (email.includes('@')) {
              requestVerificationCode()
            } else {
              alert('Please enter a valid email address！')
            }
          }}
        >
          <label>
            email:
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <Button type="submit">Send a verification code</Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            login()
          }}
        >
          <label>
            verification code:
            <Input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
          </label>
          <Button type="submit">登录</Button>
          <Button type="button" onClick={() => setIsRequestingCode(true)}>
            Resend the verification code
          </Button>
        </form>
      )}
    </div>
  )
}

export { EmailLogin }
