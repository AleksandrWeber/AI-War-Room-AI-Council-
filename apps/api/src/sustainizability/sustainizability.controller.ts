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
import { SustainizabilityAdminService } from './sustainizability-admin.service.js'

type SustainizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('sustainizability')
export class SustainizabilityController {
  constructor(
    private readonly sustainizabilityAdminService: SustainizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.sustainizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSustainizabilityRollout() {
    return this.sustainizabilityAdminService.getSustainizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSustainizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.sustainizabilityAdminService.getWorkspaceSustainizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSustainizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SustainizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_sustainizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported sustainizability admin action.',
      })
    }

    return this.sustainizabilityAdminService.executeSustainizabilityAdminAction(
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
