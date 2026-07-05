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
import { MeshingizabilityAdminService } from './meshingizability-admin.service.js'

type MeshingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('meshingizability')
export class MeshingizabilityController {
  constructor(
    private readonly meshingizabilityAdminService: MeshingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.meshingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMeshingizabilityRollout() {
    return this.meshingizabilityAdminService.getMeshingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMeshingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.meshingizabilityAdminService.getWorkspaceMeshingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMeshingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MeshingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_meshingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported meshingizability admin action.',
      })
    }

    return this.meshingizabilityAdminService.executeMeshingizabilityAdminAction(
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
