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
import { TraceabilizabilityAdminService } from './traceabilizability-admin.service.js'

type TraceabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('traceabilizability')
export class TraceabilizabilityController {
  constructor(
    private readonly traceabilizabilityAdminService: TraceabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.traceabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTraceabilizabilityRollout() {
    return this.traceabilizabilityAdminService.getTraceabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTraceabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.traceabilizabilityAdminService.getWorkspaceTraceabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTraceabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TraceabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_traceabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported traceabilizability admin action.',
      })
    }

    return this.traceabilizabilityAdminService.executeTraceabilizabilityAdminAction(
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
