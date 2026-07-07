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
import { TraceledgerizabilityAdminService } from './traceledgerizability-admin.service.js'

type TraceledgerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('traceledgerizability')
export class TraceledgerizabilityController {
  constructor(
    private readonly traceledgerizabilityAdminService: TraceledgerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.traceledgerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTraceledgerizabilityRollout() {
    return this.traceledgerizabilityAdminService.getTraceledgerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTraceledgerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.traceledgerizabilityAdminService.getWorkspaceTraceledgerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTraceledgerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TraceledgerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_traceledgerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported traceledgerizability admin action.',
      })
    }

    return this.traceledgerizabilityAdminService.executeTraceledgerizabilityAdminAction(
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
