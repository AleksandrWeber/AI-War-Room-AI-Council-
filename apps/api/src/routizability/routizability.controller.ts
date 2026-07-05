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
import { RoutizabilityAdminService } from './routizability-admin.service.js'

type RoutizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('routizability')
export class RoutizabilityController {
  constructor(
    private readonly routizabilityAdminService: RoutizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.routizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRoutizabilityRollout() {
    return this.routizabilityAdminService.getRoutizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRoutizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.routizabilityAdminService.getWorkspaceRoutizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRoutizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RoutizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_routizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported routizability admin action.',
      })
    }

    return this.routizabilityAdminService.executeRoutizabilityAdminAction(
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
