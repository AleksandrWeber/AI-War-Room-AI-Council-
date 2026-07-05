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
import { EvictionizabilityAdminService } from './evictionizability-admin.service.js'

type EvictionizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('evictionizability')
export class EvictionizabilityController {
  constructor(
    private readonly evictionizabilityAdminService: EvictionizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.evictionizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEvictionizabilityRollout() {
    return this.evictionizabilityAdminService.getEvictionizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEvictionizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.evictionizabilityAdminService.getWorkspaceEvictionizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEvictionizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EvictionizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_evictionizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported evictionizability admin action.',
      })
    }

    return this.evictionizabilityAdminService.executeEvictionizabilityAdminAction(
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
