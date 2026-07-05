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
import { EvocatabilityAdminService } from './evocatability-admin.service.js'

type EvocatabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('evocatability')
export class EvocatabilityController {
  constructor(
    private readonly evocatabilityAdminService: EvocatabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.evocatabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEvocatabilityRollout() {
    return this.evocatabilityAdminService.getEvocatabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEvocatabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.evocatabilityAdminService.getWorkspaceEvocatabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEvocatabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EvocatabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_evocatability_summary') {
      throw new BadRequestException({
        message: 'Unsupported evocatability admin action.',
      })
    }

    return this.evocatabilityAdminService.executeEvocatabilityAdminAction(
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
