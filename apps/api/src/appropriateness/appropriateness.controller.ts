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
import { AppropriatenessAdminService } from './appropriateness-admin.service.js'

type AppropriatenessAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('appropriateness')
export class AppropriatenessController {
  constructor(
    private readonly appropriatenessAdminService: AppropriatenessAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.appropriatenessAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAppropriatenessRollout() {
    return this.appropriatenessAdminService.getAppropriatenessRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAppropriatenessAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.appropriatenessAdminService.getWorkspaceAppropriatenessAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAppropriatenessAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AppropriatenessAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_appropriateness_summary') {
      throw new BadRequestException({
        message: 'Unsupported appropriateness admin action.',
      })
    }

    return this.appropriatenessAdminService.executeAppropriatenessAdminAction(
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
