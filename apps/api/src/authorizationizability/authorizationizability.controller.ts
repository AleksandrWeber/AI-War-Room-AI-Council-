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
import { AuthorizationizabilityAdminService } from './authorizationizability-admin.service.js'

type AuthorizationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('authorizationizability')
export class AuthorizationizabilityController {
  constructor(
    private readonly authorizationizabilityAdminService: AuthorizationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.authorizationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuthorizationizabilityRollout() {
    return this.authorizationizabilityAdminService.getAuthorizationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuthorizationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.authorizationizabilityAdminService.getWorkspaceAuthorizationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuthorizationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuthorizationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_authorizationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported authorizationizability admin action.',
      })
    }

    return this.authorizationizabilityAdminService.executeAuthorizationizabilityAdminAction(
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
