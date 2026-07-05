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
import { SortizabilityAdminService } from './sortizability-admin.service.js'

type SortizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('sortizability')
export class SortizabilityController {
  constructor(
    private readonly sortizabilityAdminService: SortizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.sortizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSortizabilityRollout() {
    return this.sortizabilityAdminService.getSortizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSortizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.sortizabilityAdminService.getWorkspaceSortizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSortizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SortizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_sortizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported sortizability admin action.',
      })
    }

    return this.sortizabilityAdminService.executeSortizabilityAdminAction(
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
