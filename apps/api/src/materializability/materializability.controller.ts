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
import { MaterializabilityAdminService } from './materializability-admin.service.js'

type MaterializabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('materializability')
export class MaterializabilityController {
  constructor(
    private readonly materializabilityAdminService: MaterializabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.materializabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMaterializabilityRollout() {
    return this.materializabilityAdminService.getMaterializabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMaterializabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.materializabilityAdminService.getWorkspaceMaterializabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMaterializabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MaterializabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_materializability_summary') {
      throw new BadRequestException({
        message: 'Unsupported materializability admin action.',
      })
    }

    return this.materializabilityAdminService.executeMaterializabilityAdminAction(
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
