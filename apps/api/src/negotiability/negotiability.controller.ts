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
import { NegotiabilityAdminService } from './negotiability-admin.service.js'

type NegotiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('negotiability')
export class NegotiabilityController {
  constructor(
    private readonly negotiabilityAdminService: NegotiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.negotiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNegotiabilityRollout() {
    return this.negotiabilityAdminService.getNegotiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNegotiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.negotiabilityAdminService.getWorkspaceNegotiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNegotiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NegotiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_negotiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported negotiability admin action.',
      })
    }

    return this.negotiabilityAdminService.executeNegotiabilityAdminAction(
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
