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
import { CanaryizabilityAdminService } from './canaryizability-admin.service.js'

type CanaryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('canaryizability')
export class CanaryizabilityController {
  constructor(
    private readonly canaryizabilityAdminService: CanaryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.canaryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCanaryizabilityRollout() {
    return this.canaryizabilityAdminService.getCanaryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCanaryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.canaryizabilityAdminService.getWorkspaceCanaryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCanaryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CanaryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_canaryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported canaryizability admin action.',
      })
    }

    return this.canaryizabilityAdminService.executeCanaryizabilityAdminAction(
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
