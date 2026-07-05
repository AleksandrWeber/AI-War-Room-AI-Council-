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
import { FlexibilityAdminService } from './flexibility-admin.service.js'

type FlexibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('flexibility')
export class FlexibilityController {
  constructor(
    private readonly flexibilityAdminService: FlexibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.flexibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFlexibilityRollout() {
    return this.flexibilityAdminService.getFlexibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFlexibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.flexibilityAdminService.getWorkspaceFlexibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFlexibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FlexibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_flexibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported flexibility admin action.',
      })
    }

    return this.flexibilityAdminService.executeFlexibilityAdminAction(
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
