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
import { PrivacyizabilityAdminService } from './privacyizability-admin.service.js'

type PrivacyizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('privacyizability')
export class PrivacyizabilityController {
  constructor(
    private readonly privacyizabilityAdminService: PrivacyizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.privacyizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPrivacyizabilityRollout() {
    return this.privacyizabilityAdminService.getPrivacyizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePrivacyizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.privacyizabilityAdminService.getWorkspacePrivacyizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePrivacyizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PrivacyizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_privacyizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported privacyizability admin action.',
      })
    }

    return this.privacyizabilityAdminService.executePrivacyizabilityAdminAction(
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
