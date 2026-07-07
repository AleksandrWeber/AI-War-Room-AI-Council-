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
import { AccreditationizabilityAdminService } from './accreditationizability-admin.service.js'

type AccreditationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('accreditationizability')
export class AccreditationizabilityController {
  constructor(
    private readonly accreditationizabilityAdminService: AccreditationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.accreditationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAccreditationizabilityRollout() {
    return this.accreditationizabilityAdminService.getAccreditationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAccreditationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.accreditationizabilityAdminService.getWorkspaceAccreditationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAccreditationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AccreditationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_accreditationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported accreditationizability admin action.',
      })
    }

    return this.accreditationizabilityAdminService.executeAccreditationizabilityAdminAction(
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
