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
import { MetricizabilityAdminService } from './metricizability-admin.service.js'

type MetricizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('metricizability')
export class MetricizabilityController {
  constructor(
    private readonly metricizabilityAdminService: MetricizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.metricizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMetricizabilityRollout() {
    return this.metricizabilityAdminService.getMetricizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMetricizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.metricizabilityAdminService.getWorkspaceMetricizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMetricizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MetricizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_metricizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported metricizability admin action.',
      })
    }

    return this.metricizabilityAdminService.executeMetricizabilityAdminAction(
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
