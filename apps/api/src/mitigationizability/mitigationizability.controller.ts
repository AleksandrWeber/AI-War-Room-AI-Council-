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
import { MitigationizabilityAdminService } from './mitigationizability-admin.service.js'

type MitigationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('mitigationizability')
export class MitigationizabilityController {
  constructor(
    private readonly mitigationizabilityAdminService: MitigationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.mitigationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMitigationizabilityRollout() {
    return this.mitigationizabilityAdminService.getMitigationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMitigationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.mitigationizabilityAdminService.getWorkspaceMitigationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMitigationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MitigationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_mitigationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported mitigationizability admin action.',
      })
    }

    return this.mitigationizabilityAdminService.executeMitigationizabilityAdminAction(
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
