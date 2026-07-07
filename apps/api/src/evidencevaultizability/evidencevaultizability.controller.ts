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
import { EvidencevaultizabilityAdminService } from './evidencevaultizability-admin.service.js'

type EvidencevaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('evidencevaultizability')
export class EvidencevaultizabilityController {
  constructor(
    private readonly evidencevaultizabilityAdminService: EvidencevaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.evidencevaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEvidencevaultizabilityRollout() {
    return this.evidencevaultizabilityAdminService.getEvidencevaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEvidencevaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.evidencevaultizabilityAdminService.getWorkspaceEvidencevaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEvidencevaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EvidencevaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_evidencevaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported evidencevaultizability admin action.',
      })
    }

    return this.evidencevaultizabilityAdminService.executeEvidencevaultizabilityAdminAction(
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
