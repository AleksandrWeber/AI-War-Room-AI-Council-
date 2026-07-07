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
import { EnforcementizabilityAdminService } from './enforcementizability-admin.service.js'

type EnforcementizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('enforcementizability')
export class EnforcementizabilityController {
  constructor(
    private readonly enforcementizabilityAdminService: EnforcementizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.enforcementizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEnforcementizabilityRollout() {
    return this.enforcementizabilityAdminService.getEnforcementizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEnforcementizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.enforcementizabilityAdminService.getWorkspaceEnforcementizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEnforcementizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EnforcementizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_enforcementizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported enforcementizability admin action.',
      })
    }

    return this.enforcementizabilityAdminService.executeEnforcementizabilityAdminAction(
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
