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
import { CoordinationizabilityAdminService } from './coordinationizability-admin.service.js'

type CoordinationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('coordinationizability')
export class CoordinationizabilityController {
  constructor(
    private readonly coordinationizabilityAdminService: CoordinationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.coordinationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCoordinationizabilityRollout() {
    return this.coordinationizabilityAdminService.getCoordinationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCoordinationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.coordinationizabilityAdminService.getWorkspaceCoordinationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCoordinationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CoordinationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_coordinationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported coordinationizability admin action.',
      })
    }

    return this.coordinationizabilityAdminService.executeCoordinationizabilityAdminAction(
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
