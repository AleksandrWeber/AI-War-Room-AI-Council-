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
import { ComparizabilityAdminService } from './comparizability-admin.service.js'

type ComparizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('comparizability')
export class ComparizabilityController {
  constructor(
    private readonly comparizabilityAdminService: ComparizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.comparizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComparizabilityRollout() {
    return this.comparizabilityAdminService.getComparizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComparizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.comparizabilityAdminService.getWorkspaceComparizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComparizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComparizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_comparizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported comparizability admin action.',
      })
    }

    return this.comparizabilityAdminService.executeComparizabilityAdminAction(
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
