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
import { IterativizabilityAdminService } from './iterativizability-admin.service.js'

type IterativizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('iterativizability')
export class IterativizabilityController {
  constructor(
    private readonly iterativizabilityAdminService: IterativizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.iterativizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIterativizabilityRollout() {
    return this.iterativizabilityAdminService.getIterativizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIterativizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.iterativizabilityAdminService.getWorkspaceIterativizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIterativizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IterativizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_iterativizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported iterativizability admin action.',
      })
    }

    return this.iterativizabilityAdminService.executeIterativizabilityAdminAction(
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
