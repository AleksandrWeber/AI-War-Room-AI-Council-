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
import { WitnessjournalizabilityAdminService } from './witnessjournalizability-admin.service.js'

type WitnessjournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('witnessjournalizability')
export class WitnessjournalizabilityController {
  constructor(
    private readonly witnessjournalizabilityAdminService: WitnessjournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.witnessjournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWitnessjournalizabilityRollout() {
    return this.witnessjournalizabilityAdminService.getWitnessjournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWitnessjournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.witnessjournalizabilityAdminService.getWorkspaceWitnessjournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWitnessjournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WitnessjournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_witnessjournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported witnessjournalizability admin action.',
      })
    }

    return this.witnessjournalizabilityAdminService.executeWitnessjournalizabilityAdminAction(
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
