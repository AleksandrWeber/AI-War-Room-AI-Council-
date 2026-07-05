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
import { ExplainabilityAdminService } from './explainability-admin.service.js'

type ExplainabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('explainability')
export class ExplainabilityController {
  constructor(
    private readonly explainabilityAdminService: ExplainabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.explainabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExplainabilityRollout() {
    return this.explainabilityAdminService.getExplainabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExplainabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.explainabilityAdminService.getWorkspaceExplainabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExplainabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExplainabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_explainability_summary') {
      throw new BadRequestException({
        message: 'Unsupported explainability admin action.',
      })
    }

    return this.explainabilityAdminService.executeExplainabilityAdminAction(
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
