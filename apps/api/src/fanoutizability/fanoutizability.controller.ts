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
import { FanoutizabilityAdminService } from './fanoutizability-admin.service.js'

type FanoutizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('fanoutizability')
export class FanoutizabilityController {
  constructor(
    private readonly fanoutizabilityAdminService: FanoutizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.fanoutizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFanoutizabilityRollout() {
    return this.fanoutizabilityAdminService.getFanoutizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFanoutizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.fanoutizabilityAdminService.getWorkspaceFanoutizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFanoutizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FanoutizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_fanoutizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported fanoutizability admin action.',
      })
    }

    return this.fanoutizabilityAdminService.executeFanoutizabilityAdminAction(
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
