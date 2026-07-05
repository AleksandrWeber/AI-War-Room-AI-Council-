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
import { ExpandizabilityAdminService } from './expandizability-admin.service.js'

type ExpandizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('expandizability')
export class ExpandizabilityController {
  constructor(
    private readonly expandizabilityAdminService: ExpandizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.expandizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExpandizabilityRollout() {
    return this.expandizabilityAdminService.getExpandizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExpandizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.expandizabilityAdminService.getWorkspaceExpandizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExpandizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExpandizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_expandizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported expandizability admin action.',
      })
    }

    return this.expandizabilityAdminService.executeExpandizabilityAdminAction(
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
