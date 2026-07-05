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
import { SimulatizabilityAdminService } from './simulatizability-admin.service.js'

type SimulatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('simulatizability')
export class SimulatizabilityController {
  constructor(
    private readonly simulatizabilityAdminService: SimulatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.simulatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSimulatizabilityRollout() {
    return this.simulatizabilityAdminService.getSimulatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSimulatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.simulatizabilityAdminService.getWorkspaceSimulatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSimulatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SimulatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_simulatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported simulatizability admin action.',
      })
    }

    return this.simulatizabilityAdminService.executeSimulatizabilityAdminAction(
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
