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
import { WarmizabilityAdminService } from './warmizability-admin.service.js'

type WarmizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('warmizability')
export class WarmizabilityController {
  constructor(
    private readonly warmizabilityAdminService: WarmizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.warmizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWarmizabilityRollout() {
    return this.warmizabilityAdminService.getWarmizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWarmizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.warmizabilityAdminService.getWorkspaceWarmizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWarmizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WarmizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_warmizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported warmizability admin action.',
      })
    }

    return this.warmizabilityAdminService.executeWarmizabilityAdminAction(
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
