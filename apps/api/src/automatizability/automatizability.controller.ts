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
import { AutomatizabilityAdminService } from './automatizability-admin.service.js'

type AutomatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('automatizability')
export class AutomatizabilityController {
  constructor(
    private readonly automatizabilityAdminService: AutomatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.automatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAutomatizabilityRollout() {
    return this.automatizabilityAdminService.getAutomatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAutomatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.automatizabilityAdminService.getWorkspaceAutomatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAutomatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AutomatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_automatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported automatizability admin action.',
      })
    }

    return this.automatizabilityAdminService.executeAutomatizabilityAdminAction(
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
