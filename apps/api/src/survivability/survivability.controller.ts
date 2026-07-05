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
import { SurvivabilityAdminService } from './survivability-admin.service.js'

type SurvivabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('survivability')
export class SurvivabilityController {
  constructor(
    private readonly survivabilityAdminService: SurvivabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.survivabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSurvivabilityRollout() {
    return this.survivabilityAdminService.getSurvivabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSurvivabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.survivabilityAdminService.getWorkspaceSurvivabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSurvivabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SurvivabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_survivability_summary') {
      throw new BadRequestException({
        message: 'Unsupported survivability admin action.',
      })
    }

    return this.survivabilityAdminService.executeSurvivabilityAdminAction(
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
