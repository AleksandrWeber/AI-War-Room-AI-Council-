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
import { MulticastizabilityAdminService } from './multicastizability-admin.service.js'

type MulticastizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('multicastizability')
export class MulticastizabilityController {
  constructor(
    private readonly multicastizabilityAdminService: MulticastizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.multicastizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMulticastizabilityRollout() {
    return this.multicastizabilityAdminService.getMulticastizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMulticastizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.multicastizabilityAdminService.getWorkspaceMulticastizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMulticastizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MulticastizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_multicastizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported multicastizability admin action.',
      })
    }

    return this.multicastizabilityAdminService.executeMulticastizabilityAdminAction(
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
