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
import { PhenomenizabilityAdminService } from './phenomenizability-admin.service.js'

type PhenomenizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('phenomenizability')
export class PhenomenizabilityController {
  constructor(
    private readonly phenomenizabilityAdminService: PhenomenizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.phenomenizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPhenomenizabilityRollout() {
    return this.phenomenizabilityAdminService.getPhenomenizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePhenomenizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.phenomenizabilityAdminService.getWorkspacePhenomenizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePhenomenizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PhenomenizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_phenomenizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported phenomenizability admin action.',
      })
    }

    return this.phenomenizabilityAdminService.executePhenomenizabilityAdminAction(
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
