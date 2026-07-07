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
import { IntegrityjournalizabilityAdminService } from './integrityjournalizability-admin.service.js'

type IntegrityjournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('integrityjournalizability')
export class IntegrityjournalizabilityController {
  constructor(
    private readonly integrityjournalizabilityAdminService: IntegrityjournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.integrityjournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIntegrityjournalizabilityRollout() {
    return this.integrityjournalizabilityAdminService.getIntegrityjournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIntegrityjournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.integrityjournalizabilityAdminService.getWorkspaceIntegrityjournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIntegrityjournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IntegrityjournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_integrityjournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported integrityjournalizability admin action.',
      })
    }

    return this.integrityjournalizabilityAdminService.executeIntegrityjournalizabilityAdminAction(
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
