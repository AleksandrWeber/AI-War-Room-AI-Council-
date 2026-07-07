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
import { HealingizabilityAdminService } from './healingizability-admin.service.js'

type HealingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('healingizability')
export class HealingizabilityController {
  constructor(
    private readonly healingizabilityAdminService: HealingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.healingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHealingizabilityRollout() {
    return this.healingizabilityAdminService.getHealingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHealingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.healingizabilityAdminService.getWorkspaceHealingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHealingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HealingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_healingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported healingizability admin action.',
      })
    }

    return this.healingizabilityAdminService.executeHealingizabilityAdminAction(
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
