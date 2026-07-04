import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import {
  WorkspaceAccessGuard,
  type AuthenticatedRequest,
} from '../auth/workspace-access.guard.js'
import { BillingService } from './billing.service.js'

type CheckoutSessionBody = {
  workspaceId?: unknown
  paidTier?: unknown
}

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.billingService.getCapabilities()
  }

  @Get('workspace/:workspaceId')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceStatus(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.billingService.getWorkspaceStatus(workspaceId)
  }

  @Post('checkout-session')
  @UseGuards(WorkspaceAccessGuard)
  createCheckoutSession(
    @Req() request: AuthenticatedRequest,
    @Body() body: CheckoutSessionBody,
  ) {
    const workspaceId = this.getRequestWorkspaceId(request, body)

    return this.billingService.createCheckoutSession({
      workspaceId,
      paidTier: body.paidTier as 'pro' | 'business',
      requestWorkspaceId: workspaceId,
    })
  }

  @Post('webhook')
  handleWebhook(@Req() request: FastifyRequest) {
    const signature = this.getSingleHeader(
      request.headers['stripe-signature'],
    )
    const payload = request.body

    if (payload === undefined || payload === null) {
      return this.billingService.handleWebhook('', signature)
    }

    if (Buffer.isBuffer(payload)) {
      return this.billingService.handleWebhook(payload, signature)
    }

    if (typeof payload === 'string') {
      return this.billingService.handleWebhook(payload, signature)
    }

    return this.billingService.handleWebhook(
      JSON.stringify(payload),
      signature,
    )
  }

  @Get('mock/complete')
  completeMockCheckout(@Query('sessionId') sessionId: string | undefined) {
    if (!sessionId) {
      return {
        message: 'Missing sessionId query parameter.',
      }
    }

    return this.billingService.completeMockCheckout(sessionId)
  }

  private assertWorkspaceParam(
    request: AuthenticatedRequest,
    workspaceId: string,
  ) {
    const requestWorkspaceId = request.authContext?.workspaceId

    if (requestWorkspaceId && requestWorkspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace parameter does not match authenticated workspace.',
      })
    }
  }

  private getRequestWorkspaceId(
    request: AuthenticatedRequest,
    body: CheckoutSessionBody,
  ) {
    const bodyWorkspaceId =
      typeof body.workspaceId === 'string' && body.workspaceId.trim().length > 0
        ? body.workspaceId
        : null

    return (
      bodyWorkspaceId ??
      request.authContext?.workspaceId ??
      this.getSingleHeader(request.headers['x-workspace-id']) ??
      ''
    )
  }

  private getSingleHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
  }
}
