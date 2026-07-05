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
import { RetrodictizabilityAdminService } from './retrodictizability-admin.service.js'

type RetrodictizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('retrodictizability')
export class RetrodictizabilityController {
  constructor(
    private readonly retrodictizabilityAdminService: RetrodictizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.retrodictizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRetrodictizabilityRollout() {
    return this.retrodictizabilityAdminService.getRetrodictizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRetrodictizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.retrodictizabilityAdminService.getWorkspaceRetrodictizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRetrodictizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RetrodictizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_retrodictizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported retrodictizability admin action.',
      })
    }

    return this.retrodictizabilityAdminService.executeRetrodictizabilityAdminAction(
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
