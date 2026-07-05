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
import { BatchizabilityAdminService } from './batchizability-admin.service.js'

type BatchizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('batchizability')
export class BatchizabilityController {
  constructor(
    private readonly batchizabilityAdminService: BatchizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.batchizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBatchizabilityRollout() {
    return this.batchizabilityAdminService.getBatchizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBatchizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.batchizabilityAdminService.getWorkspaceBatchizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBatchizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BatchizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_batchizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported batchizability admin action.',
      })
    }

    return this.batchizabilityAdminService.executeBatchizabilityAdminAction(
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
