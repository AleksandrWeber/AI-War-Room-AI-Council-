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
import { AbstractizabilityAdminService } from './abstractizability-admin.service.js'

type AbstractizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('abstractizability')
export class AbstractizabilityController {
  constructor(
    private readonly abstractizabilityAdminService: AbstractizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.abstractizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAbstractizabilityRollout() {
    return this.abstractizabilityAdminService.getAbstractizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAbstractizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.abstractizabilityAdminService.getWorkspaceAbstractizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAbstractizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AbstractizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_abstractizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported abstractizability admin action.',
      })
    }

    return this.abstractizabilityAdminService.executeAbstractizabilityAdminAction(
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
