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
import { IsolatizabilityAdminService } from './isolatizability-admin.service.js'

type IsolatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('isolatizability')
export class IsolatizabilityController {
  constructor(
    private readonly isolatizabilityAdminService: IsolatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.isolatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIsolatizabilityRollout() {
    return this.isolatizabilityAdminService.getIsolatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIsolatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.isolatizabilityAdminService.getWorkspaceIsolatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIsolatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IsolatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_isolatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported isolatizability admin action.',
      })
    }

    return this.isolatizabilityAdminService.executeIsolatizabilityAdminAction(
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
