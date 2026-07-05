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
import { HierarchizabilityAdminService } from './hierarchizability-admin.service.js'

type HierarchizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('hierarchizability')
export class HierarchizabilityController {
  constructor(
    private readonly hierarchizabilityAdminService: HierarchizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.hierarchizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHierarchizabilityRollout() {
    return this.hierarchizabilityAdminService.getHierarchizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHierarchizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.hierarchizabilityAdminService.getWorkspaceHierarchizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHierarchizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HierarchizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_hierarchizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported hierarchizability admin action.',
      })
    }

    return this.hierarchizabilityAdminService.executeHierarchizabilityAdminAction(
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
