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
import { PaginizabilityAdminService } from './paginizability-admin.service.js'

type PaginizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('paginizability')
export class PaginizabilityController {
  constructor(
    private readonly paginizabilityAdminService: PaginizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.paginizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPaginizabilityRollout() {
    return this.paginizabilityAdminService.getPaginizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePaginizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.paginizabilityAdminService.getWorkspacePaginizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePaginizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PaginizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_paginizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported paginizability admin action.',
      })
    }

    return this.paginizabilityAdminService.executePaginizabilityAdminAction(
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
