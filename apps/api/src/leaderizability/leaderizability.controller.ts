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
import { LeaderizabilityAdminService } from './leaderizability-admin.service.js'

type LeaderizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('leaderizability')
export class LeaderizabilityController {
  constructor(
    private readonly leaderizabilityAdminService: LeaderizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.leaderizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLeaderizabilityRollout() {
    return this.leaderizabilityAdminService.getLeaderizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLeaderizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.leaderizabilityAdminService.getWorkspaceLeaderizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLeaderizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LeaderizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_leaderizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported leaderizability admin action.',
      })
    }

    return this.leaderizabilityAdminService.executeLeaderizabilityAdminAction(
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
