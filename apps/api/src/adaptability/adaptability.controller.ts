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
import { AdaptabilityAdminService } from './adaptability-admin.service.js'

type AdaptabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('adaptability')
export class AdaptabilityController {
  constructor(
    private readonly adaptabilityAdminService: AdaptabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.adaptabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAdaptabilityRollout() {
    return this.adaptabilityAdminService.getAdaptabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAdaptabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.adaptabilityAdminService.getWorkspaceAdaptabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAdaptabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AdaptabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_adaptability_summary') {
      throw new BadRequestException({
        message: 'Unsupported adaptability admin action.',
      })
    }

    return this.adaptabilityAdminService.executeAdaptabilityAdminAction(
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
