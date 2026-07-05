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
import { UnderstandabilityAdminService } from './understandability-admin.service.js'

type UnderstandabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('understandability')
export class UnderstandabilityController {
  constructor(
    private readonly understandabilityAdminService: UnderstandabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.understandabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getUnderstandabilityRollout() {
    return this.understandabilityAdminService.getUnderstandabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceUnderstandabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.understandabilityAdminService.getWorkspaceUnderstandabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeUnderstandabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UnderstandabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_understandability_summary') {
      throw new BadRequestException({
        message: 'Unsupported understandability admin action.',
      })
    }

    return this.understandabilityAdminService.executeUnderstandabilityAdminAction(
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
