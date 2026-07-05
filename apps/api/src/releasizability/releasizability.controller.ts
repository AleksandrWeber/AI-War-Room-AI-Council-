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
import { ReleasizabilityAdminService } from './releasizability-admin.service.js'

type ReleasizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('releasizability')
export class ReleasizabilityController {
  constructor(
    private readonly releasizabilityAdminService: ReleasizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.releasizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReleasizabilityRollout() {
    return this.releasizabilityAdminService.getReleasizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReleasizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.releasizabilityAdminService.getWorkspaceReleasizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReleasizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReleasizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_releasizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported releasizability admin action.',
      })
    }

    return this.releasizabilityAdminService.executeReleasizabilityAdminAction(
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
