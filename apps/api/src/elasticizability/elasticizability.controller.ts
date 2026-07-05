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
import { ElasticizabilityAdminService } from './elasticizability-admin.service.js'

type ElasticizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('elasticizability')
export class ElasticizabilityController {
  constructor(
    private readonly elasticizabilityAdminService: ElasticizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.elasticizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getElasticizabilityRollout() {
    return this.elasticizabilityAdminService.getElasticizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceElasticizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.elasticizabilityAdminService.getWorkspaceElasticizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeElasticizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ElasticizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_elasticizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported elasticizability admin action.',
      })
    }

    return this.elasticizabilityAdminService.executeElasticizabilityAdminAction(
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
