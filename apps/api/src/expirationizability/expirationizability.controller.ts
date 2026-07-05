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
import { ExpirationizabilityAdminService } from './expirationizability-admin.service.js'

type ExpirationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('expirationizability')
export class ExpirationizabilityController {
  constructor(
    private readonly expirationizabilityAdminService: ExpirationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.expirationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExpirationizabilityRollout() {
    return this.expirationizabilityAdminService.getExpirationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExpirationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.expirationizabilityAdminService.getWorkspaceExpirationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExpirationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExpirationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_expirationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported expirationizability admin action.',
      })
    }

    return this.expirationizabilityAdminService.executeExpirationizabilityAdminAction(
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
