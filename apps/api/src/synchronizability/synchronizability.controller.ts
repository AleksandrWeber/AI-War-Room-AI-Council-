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
import { SynchronizabilityAdminService } from './synchronizability-admin.service.js'

type SynchronizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('synchronizability')
export class SynchronizabilityController {
  constructor(
    private readonly synchronizabilityAdminService: SynchronizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.synchronizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSynchronizabilityRollout() {
    return this.synchronizabilityAdminService.getSynchronizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSynchronizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.synchronizabilityAdminService.getWorkspaceSynchronizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSynchronizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SynchronizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_synchronizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported synchronizability admin action.',
      })
    }

    return this.synchronizabilityAdminService.executeSynchronizabilityAdminAction(
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
