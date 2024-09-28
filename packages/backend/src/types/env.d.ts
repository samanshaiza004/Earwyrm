module 'bun' {
  interface Env {
    MYSQL_DATABASE_URL: string
    JWT_SECRETS: string
    NODEMAILER_AUTH_EMAIL: string
    NODEMAILER_AUTH_PASS: string
  }
}
