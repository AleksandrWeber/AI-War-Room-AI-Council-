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
import { NotarproofizabilityAdminService } from './notarproofizability-admin.service.js'

type NotarproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('notarproofizability')
export class NotarproofizabilityController {
  constructor(
    private readonly notarproofizabilityAdminService: NotarproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.notarproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNotarproofizabilityRollout() {
    return this.notarproofizabilityAdminService.getNotarproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNotarproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.notarproofizabilityAdminService.getWorkspaceNotarproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNotarproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NotarproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_notarproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported notarproofizability admin action.',
      })
    }

    return this.notarproofizabilityAdminService.executeNotarproofizabilityAdminAction(
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
