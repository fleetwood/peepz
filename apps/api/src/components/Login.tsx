"use client"

import * as React from 'react'

import { AuthClient } from '@peeps/client'
import { AuthProviderId } from '@peeps/types'

import { useCurrentUser } from '@/context/CurrentUserProvider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MailIcon } from 'lucide-react'

type LoginProps = {
  buttonText?: string
  className? : string
}

const GoogleIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.23 3.62l6.9-6.9C36.1 2.55 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.99 6.2C12.44 13.15 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.55c0-1.65-.15-3.23-.43-4.76H24v9.02h12.4c-.54 2.91-2.2 5.38-4.68 7.03l7.2 5.59c4.2-3.88 6.58-9.59 6.58-16.88z" />
      <path fill="#FBBC05" d="M10.55 28.07c-.5-1.48-.79-3.06-.79-4.67 0-1.62.29-3.2.79-4.68l-7.99-6.2A23.95 23.95 0 0 0 0 23.4c0 3.87.93 7.53 2.56 10.88l7.99-6.21z" />
      <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.87-5.77l-7.2-5.59c-2.01 1.35-4.6 2.15-8.67 2.15-6.26 0-11.56-3.65-13.45-8.92l-7.99 6.21C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  )
}

const Login = ({ buttonText = 'Log in', className }: LoginProps) => {
  const { user, userLoading } = useCurrentUser()

  const authClient = React.useMemo(() => {
    return AuthClient.createWeb<unknown>()
  }, [])

  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [showEmailLogin, setShowEmailLogin] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(null)

  async function signInWithEmail() {
    setStatus(null)

    try {
      const result = await authClient.signIn({
        providerId: AuthProviderId.email,
        params    : { email },
      })

      setStatus(typeof result === 'string' ? result : null)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(message)
    }
  }

  async function signInWithGoogle() {
    setStatus(null)

    try {
      await authClient.signIn({
        providerId: AuthProviderId.google,
        params    : {},
      })
      setOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(message)
    }
  }

  if (userLoading) return null
  if (user) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} type="button">
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>Choose a method</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex gap-2">
            <Button
            className="h-10 w-10 rounded-full justify-center bg-foreground font-medium text-neutral-900 hover:bg-neutral-50"
            type="button"
            onClick={signInWithGoogle}
          >
            <GoogleIcon className="size-5" />
          </Button>

          <Button
            className="h-10 w-10 rounded-full justify-center bg-foreground font-medium text-neutral-900 hover:bg-neutral-50"
            type="button"
            onClick={() => setShowEmailLogin(!showEmailLogin)}
          >
            <MailIcon className="size-5" />
          </Button>
          </div>
          {showEmailLogin &&
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex gap-2">
                <Input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button type="button" onClick={signInWithEmail}>
                  Send link
                </Button>
              </div>
            </div>
          }

          {status ? <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-muted-foreground">{status}</pre> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

Login.displayName = 'Login'
export default Login