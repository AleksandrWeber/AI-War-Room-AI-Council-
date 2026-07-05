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
import { ArchetypizabilityAdminService } from './archetypizability-admin.service.js'

type ArchetypizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('archetypizability')
export class ArchetypizabilityController {
  constructor(
    private readonly archetypizabilityAdminService: ArchetypizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.archetypizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getArchetypizabilityRollout() {
    return this.archetypizabilityAdminService.getArchetypizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceArchetypizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.archetypizabilityAdminService.getWorkspaceArchetypizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeArchetypizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ArchetypizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_archetypizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported archetypizability admin action.',
      })
    }

    return this.archetypizabilityAdminService.executeArchetypizabilityAdminAction(
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
