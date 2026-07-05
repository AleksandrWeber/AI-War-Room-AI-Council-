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
import { ScalabilityAdminService } from './scalability-admin.service.js'

type ScalabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('scalability')
export class ScalabilityController {
  constructor(
    private readonly scalabilityAdminService: ScalabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.scalabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getScalabilityRollout() {
    return this.scalabilityAdminService.getScalabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceScalabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.scalabilityAdminService.getWorkspaceScalabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeScalabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ScalabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_scalability_summary') {
      throw new BadRequestException({
        message: 'Unsupported scalability admin action.',
      })
    }

    return this.scalabilityAdminService.executeScalabilityAdminAction(
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
