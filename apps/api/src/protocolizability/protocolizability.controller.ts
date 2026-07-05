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
import { ProtocolizabilityAdminService } from './protocolizability-admin.service.js'

type ProtocolizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('protocolizability')
export class ProtocolizabilityController {
  constructor(
    private readonly protocolizabilityAdminService: ProtocolizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.protocolizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProtocolizabilityRollout() {
    return this.protocolizabilityAdminService.getProtocolizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProtocolizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.protocolizabilityAdminService.getWorkspaceProtocolizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProtocolizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProtocolizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_protocolizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported protocolizability admin action.',
      })
    }

    return this.protocolizabilityAdminService.executeProtocolizabilityAdminAction(
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
