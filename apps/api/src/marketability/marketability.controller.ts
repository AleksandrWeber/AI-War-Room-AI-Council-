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
import { MarketabilityAdminService } from './marketability-admin.service.js'

type MarketabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('marketability')
export class MarketabilityController {
  constructor(
    private readonly marketabilityAdminService: MarketabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.marketabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMarketabilityRollout() {
    return this.marketabilityAdminService.getMarketabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMarketabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.marketabilityAdminService.getWorkspaceMarketabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMarketabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MarketabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_marketability_summary') {
      throw new BadRequestException({
        message: 'Unsupported marketability admin action.',
      })
    }

    return this.marketabilityAdminService.executeMarketabilityAdminAction(
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
