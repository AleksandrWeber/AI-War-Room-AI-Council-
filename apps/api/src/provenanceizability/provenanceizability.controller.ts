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
import { ProvenanceizabilityAdminService } from './provenanceizability-admin.service.js'

type ProvenanceizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('provenanceizability')
export class ProvenanceizabilityController {
  constructor(
    private readonly provenanceizabilityAdminService: ProvenanceizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.provenanceizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProvenanceizabilityRollout() {
    return this.provenanceizabilityAdminService.getProvenanceizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProvenanceizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.provenanceizabilityAdminService.getWorkspaceProvenanceizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProvenanceizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProvenanceizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_provenanceizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported provenanceizability admin action.',
      })
    }

    return this.provenanceizabilityAdminService.executeProvenanceizabilityAdminAction(
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
