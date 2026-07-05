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
import { ComparabilityAdminService } from './comparability-admin.service.js'

type ComparabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('comparability')
export class ComparabilityController {
  constructor(
    private readonly comparabilityAdminService: ComparabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.comparabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComparabilityRollout() {
    return this.comparabilityAdminService.getComparabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComparabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.comparabilityAdminService.getWorkspaceComparabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComparabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComparabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_comparability_summary') {
      throw new BadRequestException({
        message: 'Unsupported comparability admin action.',
      })
    }

    return this.comparabilityAdminService.executeComparabilityAdminAction(
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
