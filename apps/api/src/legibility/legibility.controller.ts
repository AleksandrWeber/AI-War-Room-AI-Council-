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
import { LegibilityAdminService } from './legibility-admin.service.js'

type LegibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('legibility')
export class LegibilityController {
  constructor(
    private readonly legibilityAdminService: LegibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.legibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLegibilityRollout() {
    return this.legibilityAdminService.getLegibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLegibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.legibilityAdminService.getWorkspaceLegibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLegibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LegibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_legibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported legibility admin action.',
      })
    }

    return this.legibilityAdminService.executeLegibilityAdminAction(
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
