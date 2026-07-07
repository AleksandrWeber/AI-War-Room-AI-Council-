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
import { KeymanagementizabilityAdminService } from './keymanagementizability-admin.service.js'

type KeymanagementizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('keymanagementizability')
export class KeymanagementizabilityController {
  constructor(
    private readonly keymanagementizabilityAdminService: KeymanagementizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.keymanagementizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getKeymanagementizabilityRollout() {
    return this.keymanagementizabilityAdminService.getKeymanagementizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceKeymanagementizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.keymanagementizabilityAdminService.getWorkspaceKeymanagementizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeKeymanagementizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: KeymanagementizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_keymanagementizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported keymanagementizability admin action.',
      })
    }

    return this.keymanagementizabilityAdminService.executeKeymanagementizabilityAdminAction(
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
