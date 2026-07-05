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
import { CompatibilizabilityAdminService } from './compatibilizability-admin.service.js'

type CompatibilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compatibilizability')
export class CompatibilizabilityController {
  constructor(
    private readonly compatibilizabilityAdminService: CompatibilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compatibilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompatibilizabilityRollout() {
    return this.compatibilizabilityAdminService.getCompatibilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompatibilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compatibilizabilityAdminService.getWorkspaceCompatibilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompatibilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompatibilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compatibilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compatibilizability admin action.',
      })
    }

    return this.compatibilizabilityAdminService.executeCompatibilizabilityAdminAction(
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
