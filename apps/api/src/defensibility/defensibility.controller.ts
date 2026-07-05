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
import { DefensibilityAdminService } from './defensibility-admin.service.js'

type DefensibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('defensibility')
export class DefensibilityController {
  constructor(
    private readonly defensibilityAdminService: DefensibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.defensibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDefensibilityRollout() {
    return this.defensibilityAdminService.getDefensibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDefensibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.defensibilityAdminService.getWorkspaceDefensibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDefensibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DefensibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_defensibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported defensibility admin action.',
      })
    }

    return this.defensibilityAdminService.executeDefensibilityAdminAction(
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
