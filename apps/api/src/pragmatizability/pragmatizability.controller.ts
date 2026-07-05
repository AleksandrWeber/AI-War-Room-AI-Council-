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
import { PragmatizabilityAdminService } from './pragmatizability-admin.service.js'

type PragmatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('pragmatizability')
export class PragmatizabilityController {
  constructor(
    private readonly pragmatizabilityAdminService: PragmatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.pragmatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPragmatizabilityRollout() {
    return this.pragmatizabilityAdminService.getPragmatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePragmatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.pragmatizabilityAdminService.getWorkspacePragmatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePragmatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PragmatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_pragmatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported pragmatizability admin action.',
      })
    }

    return this.pragmatizabilityAdminService.executePragmatizabilityAdminAction(
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
