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
import { MythicizabilityAdminService } from './mythicizability-admin.service.js'

type MythicizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('mythicizability')
export class MythicizabilityController {
  constructor(
    private readonly mythicizabilityAdminService: MythicizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.mythicizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMythicizabilityRollout() {
    return this.mythicizabilityAdminService.getMythicizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMythicizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.mythicizabilityAdminService.getWorkspaceMythicizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMythicizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MythicizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_mythicizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported mythicizability admin action.',
      })
    }

    return this.mythicizabilityAdminService.executeMythicizabilityAdminAction(
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
