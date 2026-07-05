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
import { ContainerizabilityAdminService } from './containerizability-admin.service.js'

type ContainerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('containerizability')
export class ContainerizabilityController {
  constructor(
    private readonly containerizabilityAdminService: ContainerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.containerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getContainerizabilityRollout() {
    return this.containerizabilityAdminService.getContainerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceContainerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.containerizabilityAdminService.getWorkspaceContainerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeContainerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ContainerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_containerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported containerizability admin action.',
      })
    }

    return this.containerizabilityAdminService.executeContainerizabilityAdminAction(
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
