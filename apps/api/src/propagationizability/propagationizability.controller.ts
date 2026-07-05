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
import { PropagationizabilityAdminService } from './propagationizability-admin.service.js'

type PropagationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('propagationizability')
export class PropagationizabilityController {
  constructor(
    private readonly propagationizabilityAdminService: PropagationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.propagationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPropagationizabilityRollout() {
    return this.propagationizabilityAdminService.getPropagationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePropagationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.propagationizabilityAdminService.getWorkspacePropagationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePropagationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PropagationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_propagationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported propagationizability admin action.',
      })
    }

    return this.propagationizabilityAdminService.executePropagationizabilityAdminAction(
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
