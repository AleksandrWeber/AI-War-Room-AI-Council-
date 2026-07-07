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
import { CompatibilityvaultizabilityAdminService } from './compatibilityvaultizability-admin.service.js'

type CompatibilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compatibilityvaultizability')
export class CompatibilityvaultizabilityController {
  constructor(
    private readonly compatibilityvaultizabilityAdminService: CompatibilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compatibilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompatibilityvaultizabilityRollout() {
    return this.compatibilityvaultizabilityAdminService.getCompatibilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompatibilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compatibilityvaultizabilityAdminService.getWorkspaceCompatibilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompatibilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompatibilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compatibilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compatibilityvaultizability admin action.',
      })
    }

    return this.compatibilityvaultizabilityAdminService.executeCompatibilityvaultizabilityAdminAction(
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
