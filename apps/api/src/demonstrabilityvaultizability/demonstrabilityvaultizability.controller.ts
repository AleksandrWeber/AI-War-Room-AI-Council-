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
import { DemonstrabilityvaultizabilityAdminService } from './demonstrabilityvaultizability-admin.service.js'

type DemonstrabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('demonstrabilityvaultizability')
export class DemonstrabilityvaultizabilityController {
  constructor(
    private readonly demonstrabilityvaultizabilityAdminService: DemonstrabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.demonstrabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDemonstrabilityvaultizabilityRollout() {
    return this.demonstrabilityvaultizabilityAdminService.getDemonstrabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDemonstrabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.demonstrabilityvaultizabilityAdminService.getWorkspaceDemonstrabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDemonstrabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DemonstrabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_demonstrabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported demonstrabilityvaultizability admin action.',
      })
    }

    return this.demonstrabilityvaultizabilityAdminService.executeDemonstrabilityvaultizabilityAdminAction(
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
