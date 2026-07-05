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
import { MaterializationizabilityAdminService } from './materializationizability-admin.service.js'

type MaterializationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('materializationizability')
export class MaterializationizabilityController {
  constructor(
    private readonly materializationizabilityAdminService: MaterializationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.materializationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMaterializationizabilityRollout() {
    return this.materializationizabilityAdminService.getMaterializationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMaterializationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.materializationizabilityAdminService.getWorkspaceMaterializationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMaterializationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MaterializationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_materializationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported materializationizability admin action.',
      })
    }

    return this.materializationizabilityAdminService.executeMaterializationizabilityAdminAction(
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
