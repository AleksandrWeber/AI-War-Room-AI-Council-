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
import { RelayizabilityAdminService } from './relayizability-admin.service.js'

type RelayizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('relayizability')
export class RelayizabilityController {
  constructor(
    private readonly relayizabilityAdminService: RelayizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.relayizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRelayizabilityRollout() {
    return this.relayizabilityAdminService.getRelayizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRelayizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.relayizabilityAdminService.getWorkspaceRelayizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRelayizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RelayizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_relayizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported relayizability admin action.',
      })
    }

    return this.relayizabilityAdminService.executeRelayizabilityAdminAction(
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
