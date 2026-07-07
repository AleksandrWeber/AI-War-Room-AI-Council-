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
import { AuthenticationizabilityAdminService } from './authenticationizability-admin.service.js'

type AuthenticationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('authenticationizability')
export class AuthenticationizabilityController {
  constructor(
    private readonly authenticationizabilityAdminService: AuthenticationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.authenticationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuthenticationizabilityRollout() {
    return this.authenticationizabilityAdminService.getAuthenticationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuthenticationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.authenticationizabilityAdminService.getWorkspaceAuthenticationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuthenticationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuthenticationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_authenticationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported authenticationizability admin action.',
      })
    }

    return this.authenticationizabilityAdminService.executeAuthenticationizabilityAdminAction(
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
