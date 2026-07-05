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
import { OptimizabilityAdminService } from './optimizability-admin.service.js'

type OptimizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('optimizability')
export class OptimizabilityController {
  constructor(
    private readonly optimizabilityAdminService: OptimizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.optimizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOptimizabilityRollout() {
    return this.optimizabilityAdminService.getOptimizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOptimizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.optimizabilityAdminService.getWorkspaceOptimizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOptimizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OptimizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_optimizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported optimizability admin action.',
      })
    }

    return this.optimizabilityAdminService.executeOptimizabilityAdminAction(
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
