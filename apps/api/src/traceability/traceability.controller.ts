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
import { TraceabilityAdminService } from './traceability-admin.service.js'

type TraceabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('traceability')
export class TraceabilityController {
  constructor(
    private readonly traceabilityAdminService: TraceabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.traceabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTraceabilityRollout() {
    return this.traceabilityAdminService.getTraceabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTraceabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.traceabilityAdminService.getWorkspaceTraceabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTraceabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TraceabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_traceability_summary') {
      throw new BadRequestException({
        message: 'Unsupported traceability admin action.',
      })
    }

    return this.traceabilityAdminService.executeTraceabilityAdminAction(
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
