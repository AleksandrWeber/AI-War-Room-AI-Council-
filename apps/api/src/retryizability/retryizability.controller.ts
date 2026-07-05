import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { RetryizabilityAdminService } from './retryizability-admin.service.js'

type RetryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('retryizability')
export class RetryizabilityController {
  constructor(
    private readonly retryizabilityAdminService: RetryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.retryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRetryizabilityRollout() {
    return this.retryizabilityAdminService.getRetryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRetryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.retryizabilityAdminService.getWorkspaceRetryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRetryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RetryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_retryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported retryizability admin action.',
      })
    }

    return this.retryizabilityAdminService.executeRetryizabilityAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
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
}
