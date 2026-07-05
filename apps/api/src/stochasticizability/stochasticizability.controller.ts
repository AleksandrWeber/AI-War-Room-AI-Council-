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
import { StochasticizabilityAdminService } from './stochasticizability-admin.service.js'

type StochasticizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('stochasticizability')
export class StochasticizabilityController {
  constructor(
    private readonly stochasticizabilityAdminService: StochasticizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.stochasticizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getStochasticizabilityRollout() {
    return this.stochasticizabilityAdminService.getStochasticizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceStochasticizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.stochasticizabilityAdminService.getWorkspaceStochasticizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeStochasticizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: StochasticizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_stochasticizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported stochasticizability admin action.',
      })
    }

    return this.stochasticizabilityAdminService.executeStochasticizabilityAdminAction(
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
