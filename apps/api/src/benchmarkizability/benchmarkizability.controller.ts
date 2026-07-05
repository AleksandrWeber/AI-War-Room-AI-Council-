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
import { BenchmarkizabilityAdminService } from './benchmarkizability-admin.service.js'

type BenchmarkizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('benchmarkizability')
export class BenchmarkizabilityController {
  constructor(
    private readonly benchmarkizabilityAdminService: BenchmarkizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.benchmarkizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBenchmarkizabilityRollout() {
    return this.benchmarkizabilityAdminService.getBenchmarkizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBenchmarkizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.benchmarkizabilityAdminService.getWorkspaceBenchmarkizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBenchmarkizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BenchmarkizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_benchmarkizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported benchmarkizability admin action.',
      })
    }

    return this.benchmarkizabilityAdminService.executeBenchmarkizabilityAdminAction(
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
