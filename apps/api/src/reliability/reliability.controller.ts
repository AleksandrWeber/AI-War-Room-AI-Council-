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
import { ReliabilityAdminService } from './reliability-admin.service.js'

type ReliabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('reliability')
export class ReliabilityController {
  constructor(
    private readonly reliabilityAdminService: ReliabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.reliabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReliabilityRollout() {
    return this.reliabilityAdminService.getReliabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReliabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.reliabilityAdminService.getWorkspaceReliabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReliabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReliabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_reliability_summary') {
      throw new BadRequestException({
        message: 'Unsupported reliability admin action.',
      })
    }

    return this.reliabilityAdminService.executeReliabilityAdminAction(
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
