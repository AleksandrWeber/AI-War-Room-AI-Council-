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
import { PipeliningizabilityAdminService } from './pipeliningizability-admin.service.js'

type PipeliningizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('pipeliningizability')
export class PipeliningizabilityController {
  constructor(
    private readonly pipeliningizabilityAdminService: PipeliningizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.pipeliningizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPipeliningizabilityRollout() {
    return this.pipeliningizabilityAdminService.getPipeliningizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePipeliningizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.pipeliningizabilityAdminService.getWorkspacePipeliningizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePipeliningizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PipeliningizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_pipeliningizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported pipeliningizability admin action.',
      })
    }

    return this.pipeliningizabilityAdminService.executePipeliningizabilityAdminAction(
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
