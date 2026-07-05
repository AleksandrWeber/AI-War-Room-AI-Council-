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
import { JournalizabilityAdminService } from './journalizability-admin.service.js'

type JournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('journalizability')
export class JournalizabilityController {
  constructor(
    private readonly journalizabilityAdminService: JournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.journalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getJournalizabilityRollout() {
    return this.journalizabilityAdminService.getJournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceJournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.journalizabilityAdminService.getWorkspaceJournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeJournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: JournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_journalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported journalizability admin action.',
      })
    }

    return this.journalizabilityAdminService.executeJournalizabilityAdminAction(
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
