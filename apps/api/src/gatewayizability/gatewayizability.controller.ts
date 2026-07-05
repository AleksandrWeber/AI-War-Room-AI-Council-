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
import { GatewayizabilityAdminService } from './gatewayizability-admin.service.js'

type GatewayizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('gatewayizability')
export class GatewayizabilityController {
  constructor(
    private readonly gatewayizabilityAdminService: GatewayizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.gatewayizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGatewayizabilityRollout() {
    return this.gatewayizabilityAdminService.getGatewayizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGatewayizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.gatewayizabilityAdminService.getWorkspaceGatewayizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGatewayizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GatewayizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_gatewayizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported gatewayizability admin action.',
      })
    }

    return this.gatewayizabilityAdminService.executeGatewayizabilityAdminAction(
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
