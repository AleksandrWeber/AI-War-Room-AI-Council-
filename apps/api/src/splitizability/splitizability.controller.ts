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
import { SplitizabilityAdminService } from './splitizability-admin.service.js'

type SplitizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('splitizability')
export class SplitizabilityController {
  constructor(
    private readonly splitizabilityAdminService: SplitizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.splitizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSplitizabilityRollout() {
    return this.splitizabilityAdminService.getSplitizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSplitizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.splitizabilityAdminService.getWorkspaceSplitizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSplitizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SplitizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_splitizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported splitizability admin action.',
      })
    }

    return this.splitizabilityAdminService.executeSplitizabilityAdminAction(
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
