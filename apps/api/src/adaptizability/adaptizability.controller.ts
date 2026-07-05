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
import { AdaptizabilityAdminService } from './adaptizability-admin.service.js'

type AdaptizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('adaptizability')
export class AdaptizabilityController {
  constructor(
    private readonly adaptizabilityAdminService: AdaptizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.adaptizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAdaptizabilityRollout() {
    return this.adaptizabilityAdminService.getAdaptizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAdaptizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.adaptizabilityAdminService.getWorkspaceAdaptizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAdaptizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AdaptizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_adaptizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported adaptizability admin action.',
      })
    }

    return this.adaptizabilityAdminService.executeAdaptizabilityAdminAction(
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
