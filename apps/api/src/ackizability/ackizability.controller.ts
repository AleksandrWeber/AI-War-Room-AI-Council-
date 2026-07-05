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
import { AckizabilityAdminService } from './ackizability-admin.service.js'

type AckizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('ackizability')
export class AckizabilityController {
  constructor(
    private readonly ackizabilityAdminService: AckizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.ackizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAckizabilityRollout() {
    return this.ackizabilityAdminService.getAckizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAckizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.ackizabilityAdminService.getWorkspaceAckizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAckizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AckizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_ackizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported ackizability admin action.',
      })
    }

    return this.ackizabilityAdminService.executeAckizabilityAdminAction(
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
