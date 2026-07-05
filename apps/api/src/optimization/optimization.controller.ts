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
import { OptimizationAdminService } from './optimization-admin.service.js'

type OptimizationAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('optimization')
export class OptimizationController {
  constructor(
    private readonly optimizationAdminService: OptimizationAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.optimizationAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOptimizationRollout() {
    return this.optimizationAdminService.getOptimizationRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOptimizationAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.optimizationAdminService.getWorkspaceOptimizationAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOptimizationAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OptimizationAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_optimization_summary') {
      throw new BadRequestException({
        message: 'Unsupported optimization admin action.',
      })
    }

    return this.optimizationAdminService.executeOptimizationAdminAction(
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
