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
import { DefensibilityvaultizabilityAdminService } from './defensibilityvaultizability-admin.service.js'

type DefensibilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('defensibilityvaultizability')
export class DefensibilityvaultizabilityController {
  constructor(
    private readonly defensibilityvaultizabilityAdminService: DefensibilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.defensibilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDefensibilityvaultizabilityRollout() {
    return this.defensibilityvaultizabilityAdminService.getDefensibilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDefensibilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.defensibilityvaultizabilityAdminService.getWorkspaceDefensibilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDefensibilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DefensibilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_defensibilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported defensibilityvaultizability admin action.',
      })
    }

    return this.defensibilityvaultizabilityAdminService.executeDefensibilityvaultizabilityAdminAction(
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
