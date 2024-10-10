declare module 'bun' {
  interface Env {
    readonly MYSQL_DATABASE_URL: string
    readonly JWT_SECRETS: string
    readonly NODEMAILER_AUTH_EMAIL: string
    readonly NODEMAILER_AUTH_PASS: string
  }
}
