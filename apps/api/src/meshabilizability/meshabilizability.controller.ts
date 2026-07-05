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
import { MeshabilizabilityAdminService } from './meshabilizability-admin.service.js'

type MeshabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('meshabilizability')
export class MeshabilizabilityController {
  constructor(
    private readonly meshabilizabilityAdminService: MeshabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.meshabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMeshabilizabilityRollout() {
    return this.meshabilizabilityAdminService.getMeshabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMeshabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.meshabilizabilityAdminService.getWorkspaceMeshabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMeshabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MeshabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_meshabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported meshabilizability admin action.',
      })
    }

    return this.meshabilizabilityAdminService.executeMeshabilizabilityAdminAction(
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
