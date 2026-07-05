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
import { FoldizabilityAdminService } from './foldizability-admin.service.js'

type FoldizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('foldizability')
export class FoldizabilityController {
  constructor(
    private readonly foldizabilityAdminService: FoldizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.foldizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFoldizabilityRollout() {
    return this.foldizabilityAdminService.getFoldizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFoldizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.foldizabilityAdminService.getWorkspaceFoldizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFoldizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FoldizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_foldizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported foldizability admin action.',
      })
    }

    return this.foldizabilityAdminService.executeFoldizabilityAdminAction(
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
