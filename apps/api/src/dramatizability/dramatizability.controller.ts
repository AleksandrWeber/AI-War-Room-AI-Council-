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
import { DramatizabilityAdminService } from './dramatizability-admin.service.js'

type DramatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('dramatizability')
export class DramatizabilityController {
  constructor(
    private readonly dramatizabilityAdminService: DramatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.dramatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDramatizabilityRollout() {
    return this.dramatizabilityAdminService.getDramatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDramatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.dramatizabilityAdminService.getWorkspaceDramatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDramatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DramatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_dramatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported dramatizability admin action.',
      })
    }

    return this.dramatizabilityAdminService.executeDramatizabilityAdminAction(
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
