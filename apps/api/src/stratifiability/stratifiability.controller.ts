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
import { StratifiabilityAdminService } from './stratifiability-admin.service.js'

type StratifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('stratifiability')
export class StratifiabilityController {
  constructor(
    private readonly stratifiabilityAdminService: StratifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.stratifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getStratifiabilityRollout() {
    return this.stratifiabilityAdminService.getStratifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceStratifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.stratifiabilityAdminService.getWorkspaceStratifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeStratifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: StratifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_stratifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported stratifiability admin action.',
      })
    }

    return this.stratifiabilityAdminService.executeStratifiabilityAdminAction(
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
