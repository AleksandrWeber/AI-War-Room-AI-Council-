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
import { StandardizabilityAdminService } from './standardizability-admin.service.js'

type StandardizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('standardizability')
export class StandardizabilityController {
  constructor(
    private readonly standardizabilityAdminService: StandardizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.standardizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getStandardizabilityRollout() {
    return this.standardizabilityAdminService.getStandardizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceStandardizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.standardizabilityAdminService.getWorkspaceStandardizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeStandardizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: StandardizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_standardizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported standardizability admin action.',
      })
    }

    return this.standardizabilityAdminService.executeStandardizabilityAdminAction(
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
