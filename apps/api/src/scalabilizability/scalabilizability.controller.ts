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
import { ScalabilizabilityAdminService } from './scalabilizability-admin.service.js'

type ScalabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('scalabilizability')
export class ScalabilizabilityController {
  constructor(
    private readonly scalabilizabilityAdminService: ScalabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.scalabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getScalabilizabilityRollout() {
    return this.scalabilizabilityAdminService.getScalabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceScalabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.scalabilizabilityAdminService.getWorkspaceScalabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeScalabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ScalabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_scalabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported scalabilizability admin action.',
      })
    }

    return this.scalabilizabilityAdminService.executeScalabilizabilityAdminAction(
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
