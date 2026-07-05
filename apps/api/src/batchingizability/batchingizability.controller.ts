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
import { BatchingizabilityAdminService } from './batchingizability-admin.service.js'

type BatchingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('batchingizability')
export class BatchingizabilityController {
  constructor(
    private readonly batchingizabilityAdminService: BatchingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.batchingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBatchingizabilityRollout() {
    return this.batchingizabilityAdminService.getBatchingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBatchingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.batchingizabilityAdminService.getWorkspaceBatchingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBatchingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BatchingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_batchingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported batchingizability admin action.',
      })
    }

    return this.batchingizabilityAdminService.executeBatchingizabilityAdminAction(
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
