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
import { SecurityizabilityAdminService } from './securityizability-admin.service.js'

type SecurityizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('securityizability')
export class SecurityizabilityController {
  constructor(
    private readonly securityizabilityAdminService: SecurityizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.securityizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSecurityizabilityRollout() {
    return this.securityizabilityAdminService.getSecurityizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSecurityizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.securityizabilityAdminService.getWorkspaceSecurityizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSecurityizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SecurityizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_securityizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported securityizability admin action.',
      })
    }

    return this.securityizabilityAdminService.executeSecurityizabilityAdminAction(
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
