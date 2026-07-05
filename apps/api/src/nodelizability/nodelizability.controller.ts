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
import { NodelizabilityAdminService } from './nodelizability-admin.service.js'

type NodelizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('nodelizability')
export class NodelizabilityController {
  constructor(
    private readonly nodelizabilityAdminService: NodelizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.nodelizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNodelizabilityRollout() {
    return this.nodelizabilityAdminService.getNodelizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNodelizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.nodelizabilityAdminService.getWorkspaceNodelizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNodelizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NodelizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_nodelizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported nodelizability admin action.',
      })
    }

    return this.nodelizabilityAdminService.executeNodelizabilityAdminAction(
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
