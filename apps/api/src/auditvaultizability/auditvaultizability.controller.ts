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
import { AuditvaultizabilityAdminService } from './auditvaultizability-admin.service.js'

type AuditvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('auditvaultizability')
export class AuditvaultizabilityController {
  constructor(
    private readonly auditvaultizabilityAdminService: AuditvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.auditvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuditvaultizabilityRollout() {
    return this.auditvaultizabilityAdminService.getAuditvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuditvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.auditvaultizabilityAdminService.getWorkspaceAuditvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuditvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuditvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_auditvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported auditvaultizability admin action.',
      })
    }

    return this.auditvaultizabilityAdminService.executeAuditvaultizabilityAdminAction(
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
