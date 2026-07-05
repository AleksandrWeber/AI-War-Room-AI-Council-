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
import { TransformizabilityAdminService } from './transformizability-admin.service.js'

type TransformizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('transformizability')
export class TransformizabilityController {
  constructor(
    private readonly transformizabilityAdminService: TransformizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.transformizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTransformizabilityRollout() {
    return this.transformizabilityAdminService.getTransformizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTransformizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.transformizabilityAdminService.getWorkspaceTransformizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTransformizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TransformizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_transformizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported transformizability admin action.',
      })
    }

    return this.transformizabilityAdminService.executeTransformizabilityAdminAction(
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
