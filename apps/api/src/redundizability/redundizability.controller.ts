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
import { RedundizabilityAdminService } from './redundizability-admin.service.js'

type RedundizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('redundizability')
export class RedundizabilityController {
  constructor(
    private readonly redundizabilityAdminService: RedundizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.redundizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRedundizabilityRollout() {
    return this.redundizabilityAdminService.getRedundizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRedundizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.redundizabilityAdminService.getWorkspaceRedundizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRedundizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RedundizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_redundizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported redundizability admin action.',
      })
    }

    return this.redundizabilityAdminService.executeRedundizabilityAdminAction(
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
