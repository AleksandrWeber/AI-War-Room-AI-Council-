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
import { PartitioningizabilityAdminService } from './partitioningizability-admin.service.js'

type PartitioningizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('partitioningizability')
export class PartitioningizabilityController {
  constructor(
    private readonly partitioningizabilityAdminService: PartitioningizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.partitioningizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPartitioningizabilityRollout() {
    return this.partitioningizabilityAdminService.getPartitioningizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePartitioningizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.partitioningizabilityAdminService.getWorkspacePartitioningizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePartitioningizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PartitioningizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_partitioningizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported partitioningizability admin action.',
      })
    }

    return this.partitioningizabilityAdminService.executePartitioningizabilityAdminAction(
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
