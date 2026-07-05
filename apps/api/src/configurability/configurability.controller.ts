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
import { ConfigurabilityAdminService } from './configurability-admin.service.js'

type ConfigurabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('configurability')
export class ConfigurabilityController {
  constructor(
    private readonly configurabilityAdminService: ConfigurabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.configurabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConfigurabilityRollout() {
    return this.configurabilityAdminService.getConfigurabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConfigurabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.configurabilityAdminService.getWorkspaceConfigurabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConfigurabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConfigurabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_configurability_summary') {
      throw new BadRequestException({
        message: 'Unsupported configurability admin action.',
      })
    }

    return this.configurabilityAdminService.executeConfigurabilityAdminAction(
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
