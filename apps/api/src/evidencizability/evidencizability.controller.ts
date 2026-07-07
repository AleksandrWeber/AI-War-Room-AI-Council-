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
import { EvidencizabilityAdminService } from './evidencizability-admin.service.js'

type EvidencizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('evidencizability')
export class EvidencizabilityController {
  constructor(
    private readonly evidencizabilityAdminService: EvidencizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.evidencizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEvidencizabilityRollout() {
    return this.evidencizabilityAdminService.getEvidencizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEvidencizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.evidencizabilityAdminService.getWorkspaceEvidencizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEvidencizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EvidencizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_evidencizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported evidencizability admin action.',
      })
    }

    return this.evidencizabilityAdminService.executeEvidencizabilityAdminAction(
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
