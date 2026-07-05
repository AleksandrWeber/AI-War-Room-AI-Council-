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
import { FederatizabilityAdminService } from './federatizability-admin.service.js'

type FederatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('federatizability')
export class FederatizabilityController {
  constructor(
    private readonly federatizabilityAdminService: FederatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.federatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFederatizabilityRollout() {
    return this.federatizabilityAdminService.getFederatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFederatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.federatizabilityAdminService.getWorkspaceFederatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFederatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FederatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_federatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported federatizability admin action.',
      })
    }

    return this.federatizabilityAdminService.executeFederatizabilityAdminAction(
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
