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
import { PrefetchizabilityAdminService } from './prefetchizability-admin.service.js'

type PrefetchizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('prefetchizability')
export class PrefetchizabilityController {
  constructor(
    private readonly prefetchizabilityAdminService: PrefetchizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.prefetchizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPrefetchizabilityRollout() {
    return this.prefetchizabilityAdminService.getPrefetchizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePrefetchizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.prefetchizabilityAdminService.getWorkspacePrefetchizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePrefetchizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PrefetchizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_prefetchizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported prefetchizability admin action.',
      })
    }

    return this.prefetchizabilityAdminService.executePrefetchizabilityAdminAction(
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
