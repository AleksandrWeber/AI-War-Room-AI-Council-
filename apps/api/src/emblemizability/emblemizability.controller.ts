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
import { EmblemizabilityAdminService } from './emblemizability-admin.service.js'

type EmblemizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('emblemizability')
export class EmblemizabilityController {
  constructor(
    private readonly emblemizabilityAdminService: EmblemizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.emblemizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEmblemizabilityRollout() {
    return this.emblemizabilityAdminService.getEmblemizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEmblemizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.emblemizabilityAdminService.getWorkspaceEmblemizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEmblemizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EmblemizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_emblemizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported emblemizability admin action.',
      })
    }

    return this.emblemizabilityAdminService.executeEmblemizabilityAdminAction(
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
