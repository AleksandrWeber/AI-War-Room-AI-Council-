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
import { ArticulabilityAdminService } from './articulability-admin.service.js'

type ArticulabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('articulability')
export class ArticulabilityController {
  constructor(
    private readonly articulabilityAdminService: ArticulabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.articulabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getArticulabilityRollout() {
    return this.articulabilityAdminService.getArticulabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceArticulabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.articulabilityAdminService.getWorkspaceArticulabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeArticulabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ArticulabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_articulability_summary') {
      throw new BadRequestException({
        message: 'Unsupported articulability admin action.',
      })
    }

    return this.articulabilityAdminService.executeArticulabilityAdminAction(
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
