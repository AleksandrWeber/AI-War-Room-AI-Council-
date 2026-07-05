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
import { TolerizabilityAdminService } from './tolerizability-admin.service.js'

type TolerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('tolerizability')
export class TolerizabilityController {
  constructor(
    private readonly tolerizabilityAdminService: TolerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.tolerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTolerizabilityRollout() {
    return this.tolerizabilityAdminService.getTolerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTolerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.tolerizabilityAdminService.getWorkspaceTolerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTolerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TolerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_tolerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported tolerizability admin action.',
      })
    }

    return this.tolerizabilityAdminService.executeTolerizabilityAdminAction(
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
