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
import { FalsifiizabilityAdminService } from './falsifiizability-admin.service.js'

type FalsifiizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('falsifiizability')
export class FalsifiizabilityController {
  constructor(
    private readonly falsifiizabilityAdminService: FalsifiizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.falsifiizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFalsifiizabilityRollout() {
    return this.falsifiizabilityAdminService.getFalsifiizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFalsifiizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.falsifiizabilityAdminService.getWorkspaceFalsifiizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFalsifiizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FalsifiizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_falsifiizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported falsifiizability admin action.',
      })
    }

    return this.falsifiizabilityAdminService.executeFalsifiizabilityAdminAction(
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
