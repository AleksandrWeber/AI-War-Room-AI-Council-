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
import { ShardingizabilityAdminService } from './shardingizability-admin.service.js'

type ShardingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('shardingizability')
export class ShardingizabilityController {
  constructor(
    private readonly shardingizabilityAdminService: ShardingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.shardingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getShardingizabilityRollout() {
    return this.shardingizabilityAdminService.getShardingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceShardingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.shardingizabilityAdminService.getWorkspaceShardingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeShardingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ShardingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_shardingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported shardingizability admin action.',
      })
    }

    return this.shardingizabilityAdminService.executeShardingizabilityAdminAction(
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
