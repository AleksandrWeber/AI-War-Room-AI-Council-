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
import { DistributizabilityAdminService } from './distributizability-admin.service.js'

type DistributizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('distributizability')
export class DistributizabilityController {
  constructor(
    private readonly distributizabilityAdminService: DistributizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.distributizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDistributizabilityRollout() {
    return this.distributizabilityAdminService.getDistributizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDistributizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.distributizabilityAdminService.getWorkspaceDistributizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDistributizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DistributizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_distributizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported distributizability admin action.',
      })
    }

    return this.distributizabilityAdminService.executeDistributizabilityAdminAction(
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
