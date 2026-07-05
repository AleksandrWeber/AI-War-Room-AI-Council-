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
import { InferencizabilityAdminService } from './inferencizability-admin.service.js'

type InferencizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('inferencizability')
export class InferencizabilityController {
  constructor(
    private readonly inferencizabilityAdminService: InferencizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.inferencizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInferencizabilityRollout() {
    return this.inferencizabilityAdminService.getInferencizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInferencizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.inferencizabilityAdminService.getWorkspaceInferencizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInferencizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InferencizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_inferencizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported inferencizability admin action.',
      })
    }

    return this.inferencizabilityAdminService.executeInferencizabilityAdminAction(
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
