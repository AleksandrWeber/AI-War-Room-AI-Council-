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
import { NarratabilityAdminService } from './narratability-admin.service.js'

type NarratabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('narratability')
export class NarratabilityController {
  constructor(
    private readonly narratabilityAdminService: NarratabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.narratabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNarratabilityRollout() {
    return this.narratabilityAdminService.getNarratabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNarratabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.narratabilityAdminService.getWorkspaceNarratabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNarratabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NarratabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_narratability_summary') {
      throw new BadRequestException({
        message: 'Unsupported narratability admin action.',
      })
    }

    return this.narratabilityAdminService.executeNarratabilityAdminAction(
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
