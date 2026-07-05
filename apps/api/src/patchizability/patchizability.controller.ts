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
import { PatchizabilityAdminService } from './patchizability-admin.service.js'

type PatchizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('patchizability')
export class PatchizabilityController {
  constructor(
    private readonly patchizabilityAdminService: PatchizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.patchizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPatchizabilityRollout() {
    return this.patchizabilityAdminService.getPatchizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePatchizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.patchizabilityAdminService.getWorkspacePatchizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePatchizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PatchizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_patchizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported patchizability admin action.',
      })
    }

    return this.patchizabilityAdminService.executePatchizabilityAdminAction(
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
