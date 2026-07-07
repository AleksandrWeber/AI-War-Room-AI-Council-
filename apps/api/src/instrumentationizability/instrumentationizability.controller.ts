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
import { InstrumentationizabilityAdminService } from './instrumentationizability-admin.service.js'

type InstrumentationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('instrumentationizability')
export class InstrumentationizabilityController {
  constructor(
    private readonly instrumentationizabilityAdminService: InstrumentationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.instrumentationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInstrumentationizabilityRollout() {
    return this.instrumentationizabilityAdminService.getInstrumentationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInstrumentationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.instrumentationizabilityAdminService.getWorkspaceInstrumentationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInstrumentationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InstrumentationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_instrumentationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported instrumentationizability admin action.',
      })
    }

    return this.instrumentationizabilityAdminService.executeInstrumentationizabilityAdminAction(
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
