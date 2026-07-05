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
import { RetentionizabilityAdminService } from './retentionizability-admin.service.js'

type RetentionizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('retentionizability')
export class RetentionizabilityController {
  constructor(
    private readonly retentionizabilityAdminService: RetentionizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.retentionizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRetentionizabilityRollout() {
    return this.retentionizabilityAdminService.getRetentionizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRetentionizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.retentionizabilityAdminService.getWorkspaceRetentionizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRetentionizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RetentionizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_retentionizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported retentionizability admin action.',
      })
    }

    return this.retentionizabilityAdminService.executeRetentionizabilityAdminAction(
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
