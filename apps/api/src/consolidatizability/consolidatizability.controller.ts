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
import { ConsolidatizabilityAdminService } from './consolidatizability-admin.service.js'

type ConsolidatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('consolidatizability')
export class ConsolidatizabilityController {
  constructor(
    private readonly consolidatizabilityAdminService: ConsolidatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.consolidatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConsolidatizabilityRollout() {
    return this.consolidatizabilityAdminService.getConsolidatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConsolidatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.consolidatizabilityAdminService.getWorkspaceConsolidatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConsolidatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConsolidatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_consolidatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported consolidatizability admin action.',
      })
    }

    return this.consolidatizabilityAdminService.executeConsolidatizabilityAdminAction(
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
