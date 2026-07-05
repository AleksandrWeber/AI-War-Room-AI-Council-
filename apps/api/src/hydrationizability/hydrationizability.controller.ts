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
import { HydrationizabilityAdminService } from './hydrationizability-admin.service.js'

type HydrationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('hydrationizability')
export class HydrationizabilityController {
  constructor(
    private readonly hydrationizabilityAdminService: HydrationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.hydrationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHydrationizabilityRollout() {
    return this.hydrationizabilityAdminService.getHydrationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHydrationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.hydrationizabilityAdminService.getWorkspaceHydrationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHydrationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HydrationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_hydrationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported hydrationizability admin action.',
      })
    }

    return this.hydrationizabilityAdminService.executeHydrationizabilityAdminAction(
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
