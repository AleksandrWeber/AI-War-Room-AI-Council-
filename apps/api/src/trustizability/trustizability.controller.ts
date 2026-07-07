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
import { TrustizabilityAdminService } from './trustizability-admin.service.js'

type TrustizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('trustizability')
export class TrustizabilityController {
  constructor(
    private readonly trustizabilityAdminService: TrustizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.trustizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTrustizabilityRollout() {
    return this.trustizabilityAdminService.getTrustizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTrustizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.trustizabilityAdminService.getWorkspaceTrustizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTrustizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TrustizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_trustizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported trustizability admin action.',
      })
    }

    return this.trustizabilityAdminService.executeTrustizabilityAdminAction(
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
