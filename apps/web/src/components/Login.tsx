"use client"

import * as React from 'react'

import { AuthClient } from '@peeps/client'

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

export type LoginProps = {
  buttonText?: string
  className? : string
}

const Login = ({ buttonText = 'Log in', className }: LoginProps) => {
  const { user, userLoading } = useCurrentUser()

  const authClient = React.useMemo(() => {
    return AuthClient.createWeb<unknown>()
  }, [])

  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  async function signInWithEmail() {
    setStatus(null)

    try {
      const message = await authClient.signInWithEmail({ email })
      setStatus(message)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(message)
    }
  }

  async function signInWithGoogle() {
    setStatus(null)

    try {
      await authClient.signInWithGoogle()
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
          <Button variant="secondary" type="button" onClick={signInWithGoogle}>
            Continue with Google
          </Button>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <div className="flex gap-2">
              <Input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="button" onClick={signInWithEmail}>
                Send magic link
              </Button>
            </div>
          </div>

          {status ? <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-muted-foreground">{status}</pre> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

Login.displayName = 'Login'
export default Login