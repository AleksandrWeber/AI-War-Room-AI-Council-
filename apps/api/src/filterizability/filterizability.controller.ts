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
import { FilterizabilityAdminService } from './filterizability-admin.service.js'

type FilterizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('filterizability')
export class FilterizabilityController {
  constructor(
    private readonly filterizabilityAdminService: FilterizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.filterizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFilterizabilityRollout() {
    return this.filterizabilityAdminService.getFilterizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFilterizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.filterizabilityAdminService.getWorkspaceFilterizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFilterizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FilterizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_filterizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported filterizability admin action.',
      })
    }

    return this.filterizabilityAdminService.executeFilterizabilityAdminAction(
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
