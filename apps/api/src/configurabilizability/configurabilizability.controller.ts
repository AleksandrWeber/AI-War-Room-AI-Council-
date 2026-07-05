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
import { ConfigurabilizabilityAdminService } from './configurabilizability-admin.service.js'

type ConfigurabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('configurabilizability')
export class ConfigurabilizabilityController {
  constructor(
    private readonly configurabilizabilityAdminService: ConfigurabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.configurabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConfigurabilizabilityRollout() {
    return this.configurabilizabilityAdminService.getConfigurabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConfigurabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.configurabilizabilityAdminService.getWorkspaceConfigurabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConfigurabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConfigurabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_configurabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported configurabilizability admin action.',
      })
    }

    return this.configurabilizabilityAdminService.executeConfigurabilizabilityAdminAction(
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
