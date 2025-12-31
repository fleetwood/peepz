import { Resend } from 'resend'

import { serverEnv } from '@peeps/config/env'
import type { ServiceResult } from '@peeps/types'

const resend = new Resend(serverEnv.RESEND_API_KEY)

type SendEmailParams = {
  to     : string
  subject: string
  html   : string
}

export class ResendService {
  static async sendEmail(params: SendEmailParams): Promise<ServiceResult<{ id: string }>> {
    try {
      const { data, error } = await resend.emails.send({
        from   : 'Peeps <noreply@peeps.app>',
        to     : params.to,
        subject: params.subject,
        html   : params.html,
      })

      if (error || !data?.id) {
        return {
          status: 500,
          error : error?.message ?? 'Failed to send email',
        }
      }

      return { status: 200, result: { id: data.id } }
    } catch (error) {
      return {
        status: 500,
        error : error instanceof Error ? error.message : String(error),
      }
    }
  }
}
