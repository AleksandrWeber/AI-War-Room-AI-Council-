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
import { OrchestrabilityAdminService } from './orchestrability-admin.service.js'

type OrchestrabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('orchestrability')
export class OrchestrabilityController {
  constructor(
    private readonly orchestrabilityAdminService: OrchestrabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.orchestrabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOrchestrabilityRollout() {
    return this.orchestrabilityAdminService.getOrchestrabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOrchestrabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.orchestrabilityAdminService.getWorkspaceOrchestrabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOrchestrabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OrchestrabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_orchestrability_summary') {
      throw new BadRequestException({
        message: 'Unsupported orchestrability admin action.',
      })
    }

    return this.orchestrabilityAdminService.executeOrchestrabilityAdminAction(
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
