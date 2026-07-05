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
import { PersistizabilityAdminService } from './persistizability-admin.service.js'

type PersistizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('persistizability')
export class PersistizabilityController {
  constructor(
    private readonly persistizabilityAdminService: PersistizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.persistizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPersistizabilityRollout() {
    return this.persistizabilityAdminService.getPersistizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePersistizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.persistizabilityAdminService.getWorkspacePersistizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePersistizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PersistizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_persistizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported persistizability admin action.',
      })
    }

    return this.persistizabilityAdminService.executePersistizabilityAdminAction(
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
