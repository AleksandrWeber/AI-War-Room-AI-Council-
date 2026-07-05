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
import { LocatabilityAdminService } from './locatability-admin.service.js'

type LocatabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('locatability')
export class LocatabilityController {
  constructor(
    private readonly locatabilityAdminService: LocatabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.locatabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLocatabilityRollout() {
    return this.locatabilityAdminService.getLocatabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLocatabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.locatabilityAdminService.getWorkspaceLocatabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLocatabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LocatabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_locatability_summary') {
      throw new BadRequestException({
        message: 'Unsupported locatability admin action.',
      })
    }

    return this.locatabilityAdminService.executeLocatabilityAdminAction(
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
