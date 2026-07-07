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
import { EvidencetrackizabilityAdminService } from './evidencetrackizability-admin.service.js'

type EvidencetrackizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('evidencetrackizability')
export class EvidencetrackizabilityController {
  constructor(
    private readonly evidencetrackizabilityAdminService: EvidencetrackizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.evidencetrackizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEvidencetrackizabilityRollout() {
    return this.evidencetrackizabilityAdminService.getEvidencetrackizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEvidencetrackizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.evidencetrackizabilityAdminService.getWorkspaceEvidencetrackizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEvidencetrackizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EvidencetrackizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_evidencetrackizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported evidencetrackizability admin action.',
      })
    }

    return this.evidencetrackizabilityAdminService.executeEvidencetrackizabilityAdminAction(
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
