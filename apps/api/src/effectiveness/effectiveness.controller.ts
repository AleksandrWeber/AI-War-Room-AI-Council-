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
import { EffectivenessAdminService } from './effectiveness-admin.service.js'

type EffectivenessAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('effectiveness')
export class EffectivenessController {
  constructor(
    private readonly effectivenessAdminService: EffectivenessAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.effectivenessAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEffectivenessRollout() {
    return this.effectivenessAdminService.getEffectivenessRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEffectivenessAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.effectivenessAdminService.getWorkspaceEffectivenessAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEffectivenessAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EffectivenessAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_effectiveness_summary') {
      throw new BadRequestException({
        message: 'Unsupported effectiveness admin action.',
      })
    }

    return this.effectivenessAdminService.executeEffectivenessAdminAction(
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
