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
import { InductizabilityAdminService } from './inductizability-admin.service.js'

type InductizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('inductizability')
export class InductizabilityController {
  constructor(
    private readonly inductizabilityAdminService: InductizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.inductizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInductizabilityRollout() {
    return this.inductizabilityAdminService.getInductizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInductizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.inductizabilityAdminService.getWorkspaceInductizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInductizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InductizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_inductizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported inductizability admin action.',
      })
    }

    return this.inductizabilityAdminService.executeInductizabilityAdminAction(
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
