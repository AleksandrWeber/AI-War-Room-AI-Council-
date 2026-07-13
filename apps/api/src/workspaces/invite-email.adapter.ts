import { randomUUID } from 'node:crypto'

export const INVITE_EMAIL_ADAPTER = Symbol('INVITE_EMAIL_ADAPTER')

export type InviteEmailDelivery = 'mock' | 'email_stub'

export type InviteEmailSendInput = {
  to: string
  inviteUrl: string
  workspaceId: string
  role: string
  expiresAt: string
}

export type InviteEmailSendResult = {
  delivery: InviteEmailDelivery
  deliveryReference: string
}

export interface InviteEmailAdapter {
  send(input: InviteEmailSendInput): Promise<InviteEmailSendResult>
}

export class MockInviteEmailAdapter implements InviteEmailAdapter {
  readonly lastSent: InviteEmailSendInput[] = []

  async send(input: InviteEmailSendInput): Promise<InviteEmailSendResult> {
    this.lastSent.push(input)

    return {
      delivery: 'mock',
      deliveryReference: `mock_invite_${randomUUID()}`,
    }
  }
}

export class EmailStubInviteEmailAdapter implements InviteEmailAdapter {
  constructor(private readonly fromAddress: string) {}

  async send(input: InviteEmailSendInput): Promise<InviteEmailSendResult> {
    if (!this.fromAddress) {
      throw new Error(
        'INVITE_EMAIL_FROM is required when INVITE_EMAIL_ADAPTER=email.',
      )
    }

    void this.fromAddress

    return {
      delivery: 'email_stub',
      deliveryReference: `email_stub_invite_${input.workspaceId}`,
    }
  }
}
