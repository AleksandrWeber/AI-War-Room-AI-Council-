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
import { GnoseizabilityAdminService } from './gnoseizability-admin.service.js'

type GnoseizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('gnoseizability')
export class GnoseizabilityController {
  constructor(
    private readonly gnoseizabilityAdminService: GnoseizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.gnoseizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGnoseizabilityRollout() {
    return this.gnoseizabilityAdminService.getGnoseizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGnoseizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.gnoseizabilityAdminService.getWorkspaceGnoseizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGnoseizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GnoseizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_gnoseizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported gnoseizability admin action.',
      })
    }

    return this.gnoseizabilityAdminService.executeGnoseizabilityAdminAction(
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
