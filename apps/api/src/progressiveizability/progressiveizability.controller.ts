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
import { ProgressiveizabilityAdminService } from './progressiveizability-admin.service.js'

type ProgressiveizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('progressiveizability')
export class ProgressiveizabilityController {
  constructor(
    private readonly progressiveizabilityAdminService: ProgressiveizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.progressiveizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProgressiveizabilityRollout() {
    return this.progressiveizabilityAdminService.getProgressiveizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProgressiveizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.progressiveizabilityAdminService.getWorkspaceProgressiveizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProgressiveizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProgressiveizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_progressiveizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported progressiveizability admin action.',
      })
    }

    return this.progressiveizabilityAdminService.executeProgressiveizabilityAdminAction(
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
