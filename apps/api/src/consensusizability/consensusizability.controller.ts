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
import { ConsensusizabilityAdminService } from './consensusizability-admin.service.js'

type ConsensusizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('consensusizability')
export class ConsensusizabilityController {
  constructor(
    private readonly consensusizabilityAdminService: ConsensusizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.consensusizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConsensusizabilityRollout() {
    return this.consensusizabilityAdminService.getConsensusizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConsensusizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.consensusizabilityAdminService.getWorkspaceConsensusizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConsensusizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConsensusizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_consensusizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported consensusizability admin action.',
      })
    }

    return this.consensusizabilityAdminService.executeConsensusizabilityAdminAction(
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
