import server from '@/lib/server'
import { Button, Input } from '@components/ui'

const EmailLogin = () => {
  // 邮箱和验证码状态
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  // 控制显示哪个表单
  const [isRequestingCode, setIsRequestingCode] = useState(true)

  // 发送验证码的函数（这里仅模拟）
  const requestVerificationCode = useCallback(async () => {
    await server.authority.login.post({ email: email })
    console.log(`验证码已发送到邮箱: ${email}`)
    // 这里应该是调用API发送验证码到邮箱的逻辑
    setIsRequestingCode(false) // 切换到验证码输入表单
  }, [email])

  // 登录函数（这里仅模拟）
  const login = useCallback(async () => {
    if (verificationCode) {
      const { data } = await server.authority.login.post({ email: email, randomCode: verificationCode })
      // @ts-ignore
      localStorage.setItem('token', data)
      console.log('登录成功!')
      location.reload()
    } else {
      console.log('请输入验证码!')
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
              alert('请输入有效的邮箱地址！')
            }
          }}
        >
          <label>
            邮箱:
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <Button type="submit">发送验证码</Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            login()
          }}
        >
          <label>
            验证码:
            <Input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
          </label>
          <Button type="submit">登录</Button>
          <Button type="button" onClick={() => setIsRequestingCode(true)}>
            重新发送验证码
          </Button>
        </form>
      )}
    </div>
  )
}

EmailLogin.displayName = 'EmailLogin'

export { EmailLogin }
