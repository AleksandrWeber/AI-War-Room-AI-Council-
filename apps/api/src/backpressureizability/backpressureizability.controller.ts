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
import { BackpressureizabilityAdminService } from './backpressureizability-admin.service.js'

type BackpressureizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('backpressureizability')
export class BackpressureizabilityController {
  constructor(
    private readonly backpressureizabilityAdminService: BackpressureizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.backpressureizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBackpressureizabilityRollout() {
    return this.backpressureizabilityAdminService.getBackpressureizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBackpressureizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.backpressureizabilityAdminService.getWorkspaceBackpressureizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBackpressureizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BackpressureizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_backpressureizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported backpressureizability admin action.',
      })
    }

    return this.backpressureizabilityAdminService.executeBackpressureizabilityAdminAction(
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
