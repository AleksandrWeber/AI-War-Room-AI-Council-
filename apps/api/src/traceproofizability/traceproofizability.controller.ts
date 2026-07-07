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
import { TraceproofizabilityAdminService } from './traceproofizability-admin.service.js'

type TraceproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('traceproofizability')
export class TraceproofizabilityController {
  constructor(
    private readonly traceproofizabilityAdminService: TraceproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.traceproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTraceproofizabilityRollout() {
    return this.traceproofizabilityAdminService.getTraceproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTraceproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.traceproofizabilityAdminService.getWorkspaceTraceproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTraceproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TraceproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_traceproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported traceproofizability admin action.',
      })
    }

    return this.traceproofizabilityAdminService.executeTraceproofizabilityAdminAction(
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
