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
import { TransparencyizabilityAdminService } from './transparencyizability-admin.service.js'

type TransparencyizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('transparencyizability')
export class TransparencyizabilityController {
  constructor(
    private readonly transparencyizabilityAdminService: TransparencyizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.transparencyizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTransparencyizabilityRollout() {
    return this.transparencyizabilityAdminService.getTransparencyizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTransparencyizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.transparencyizabilityAdminService.getWorkspaceTransparencyizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTransparencyizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TransparencyizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_transparencyizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported transparencyizability admin action.',
      })
    }

    return this.transparencyizabilityAdminService.executeTransparencyizabilityAdminAction(
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
