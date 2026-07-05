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
import { MorphizabilityAdminService } from './morphizability-admin.service.js'

type MorphizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('morphizability')
export class MorphizabilityController {
  constructor(
    private readonly morphizabilityAdminService: MorphizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.morphizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMorphizabilityRollout() {
    return this.morphizabilityAdminService.getMorphizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMorphizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.morphizabilityAdminService.getWorkspaceMorphizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMorphizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MorphizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_morphizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported morphizability admin action.',
      })
    }

    return this.morphizabilityAdminService.executeMorphizabilityAdminAction(
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
