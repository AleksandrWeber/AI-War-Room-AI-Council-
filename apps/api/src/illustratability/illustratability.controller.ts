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
import { IllustratabilityAdminService } from './illustratability-admin.service.js'

type IllustratabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('illustratability')
export class IllustratabilityController {
  constructor(
    private readonly illustratabilityAdminService: IllustratabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.illustratabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIllustratabilityRollout() {
    return this.illustratabilityAdminService.getIllustratabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIllustratabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.illustratabilityAdminService.getWorkspaceIllustratabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIllustratabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IllustratabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_illustratability_summary') {
      throw new BadRequestException({
        message: 'Unsupported illustratability admin action.',
      })
    }

    return this.illustratabilityAdminService.executeIllustratabilityAdminAction(
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
