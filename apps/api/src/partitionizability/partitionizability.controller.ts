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
import { PartitionizabilityAdminService } from './partitionizability-admin.service.js'

type PartitionizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('partitionizability')
export class PartitionizabilityController {
  constructor(
    private readonly partitionizabilityAdminService: PartitionizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.partitionizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPartitionizabilityRollout() {
    return this.partitionizabilityAdminService.getPartitionizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePartitionizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.partitionizabilityAdminService.getWorkspacePartitionizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePartitionizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PartitionizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_partitionizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported partitionizability admin action.',
      })
    }

    return this.partitionizabilityAdminService.executePartitionizabilityAdminAction(
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
