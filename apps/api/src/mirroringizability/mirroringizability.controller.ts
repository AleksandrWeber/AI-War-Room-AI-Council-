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
import { MirroringizabilityAdminService } from './mirroringizability-admin.service.js'

type MirroringizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('mirroringizability')
export class MirroringizabilityController {
  constructor(
    private readonly mirroringizabilityAdminService: MirroringizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.mirroringizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMirroringizabilityRollout() {
    return this.mirroringizabilityAdminService.getMirroringizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMirroringizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.mirroringizabilityAdminService.getWorkspaceMirroringizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMirroringizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MirroringizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_mirroringizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported mirroringizability admin action.',
      })
    }

    return this.mirroringizabilityAdminService.executeMirroringizabilityAdminAction(
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
