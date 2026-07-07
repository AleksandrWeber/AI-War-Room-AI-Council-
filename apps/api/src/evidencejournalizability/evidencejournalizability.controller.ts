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
import { EvidencejournalizabilityAdminService } from './evidencejournalizability-admin.service.js'

type EvidencejournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('evidencejournalizability')
export class EvidencejournalizabilityController {
  constructor(
    private readonly evidencejournalizabilityAdminService: EvidencejournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.evidencejournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEvidencejournalizabilityRollout() {
    return this.evidencejournalizabilityAdminService.getEvidencejournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEvidencejournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.evidencejournalizabilityAdminService.getWorkspaceEvidencejournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEvidencejournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EvidencejournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_evidencejournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported evidencejournalizability admin action.',
      })
    }

    return this.evidencejournalizabilityAdminService.executeEvidencejournalizabilityAdminAction(
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
