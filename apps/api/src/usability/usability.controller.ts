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
import { UsabilityAdminService } from './usability-admin.service.js'

type UsabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('usability')
export class UsabilityController {
  constructor(
    private readonly usabilityAdminService: UsabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.usabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getUsabilityRollout() {
    return this.usabilityAdminService.getUsabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceUsabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.usabilityAdminService.getWorkspaceUsabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeUsabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UsabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_usability_summary') {
      throw new BadRequestException({
        message: 'Unsupported usability admin action.',
      })
    }

    return this.usabilityAdminService.executeUsabilityAdminAction(
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
