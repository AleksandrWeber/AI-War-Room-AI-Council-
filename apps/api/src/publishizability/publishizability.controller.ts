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
import { PublishizabilityAdminService } from './publishizability-admin.service.js'

type PublishizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('publishizability')
export class PublishizabilityController {
  constructor(
    private readonly publishizabilityAdminService: PublishizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.publishizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPublishizabilityRollout() {
    return this.publishizabilityAdminService.getPublishizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePublishizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.publishizabilityAdminService.getWorkspacePublishizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePublishizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PublishizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_publishizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported publishizability admin action.',
      })
    }

    return this.publishizabilityAdminService.executePublishizabilityAdminAction(
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
