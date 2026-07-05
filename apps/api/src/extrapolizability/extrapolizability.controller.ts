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
import { ExtrapolizabilityAdminService } from './extrapolizability-admin.service.js'

type ExtrapolizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('extrapolizability')
export class ExtrapolizabilityController {
  constructor(
    private readonly extrapolizabilityAdminService: ExtrapolizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.extrapolizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExtrapolizabilityRollout() {
    return this.extrapolizabilityAdminService.getExtrapolizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExtrapolizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.extrapolizabilityAdminService.getWorkspaceExtrapolizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExtrapolizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExtrapolizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_extrapolizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported extrapolizability admin action.',
      })
    }

    return this.extrapolizabilityAdminService.executeExtrapolizabilityAdminAction(
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
