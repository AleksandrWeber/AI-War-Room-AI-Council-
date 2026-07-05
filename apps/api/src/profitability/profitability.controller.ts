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
import { ProfitabilityAdminService } from './profitability-admin.service.js'

type ProfitabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('profitability')
export class ProfitabilityController {
  constructor(
    private readonly profitabilityAdminService: ProfitabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.profitabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProfitabilityRollout() {
    return this.profitabilityAdminService.getProfitabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProfitabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.profitabilityAdminService.getWorkspaceProfitabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProfitabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProfitabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_profitability_summary') {
      throw new BadRequestException({
        message: 'Unsupported profitability admin action.',
      })
    }

    return this.profitabilityAdminService.executeProfitabilityAdminAction(
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
