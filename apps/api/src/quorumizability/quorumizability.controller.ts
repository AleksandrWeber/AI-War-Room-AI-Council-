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
import { QuorumizabilityAdminService } from './quorumizability-admin.service.js'

type QuorumizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('quorumizability')
export class QuorumizabilityController {
  constructor(
    private readonly quorumizabilityAdminService: QuorumizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.quorumizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getQuorumizabilityRollout() {
    return this.quorumizabilityAdminService.getQuorumizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceQuorumizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.quorumizabilityAdminService.getWorkspaceQuorumizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeQuorumizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: QuorumizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_quorumizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported quorumizability admin action.',
      })
    }

    return this.quorumizabilityAdminService.executeQuorumizabilityAdminAction(
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
