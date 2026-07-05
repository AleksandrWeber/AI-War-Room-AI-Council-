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
import { TeachabilityAdminService } from './teachability-admin.service.js'

type TeachabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('teachability')
export class TeachabilityController {
  constructor(
    private readonly teachabilityAdminService: TeachabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.teachabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTeachabilityRollout() {
    return this.teachabilityAdminService.getTeachabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTeachabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.teachabilityAdminService.getWorkspaceTeachabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTeachabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TeachabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_teachability_summary') {
      throw new BadRequestException({
        message: 'Unsupported teachability admin action.',
      })
    }

    return this.teachabilityAdminService.executeTeachabilityAdminAction(
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
