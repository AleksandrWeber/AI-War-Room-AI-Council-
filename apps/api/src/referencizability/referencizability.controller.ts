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
import { ReferencizabilityAdminService } from './referencizability-admin.service.js'

type ReferencizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('referencizability')
export class ReferencizabilityController {
  constructor(
    private readonly referencizabilityAdminService: ReferencizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.referencizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReferencizabilityRollout() {
    return this.referencizabilityAdminService.getReferencizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReferencizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.referencizabilityAdminService.getWorkspaceReferencizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReferencizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReferencizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_referencizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported referencizability admin action.',
      })
    }

    return this.referencizabilityAdminService.executeReferencizabilityAdminAction(
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
