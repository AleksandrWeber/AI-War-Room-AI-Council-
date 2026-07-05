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
import { TypologizabilityAdminService } from './typologizability-admin.service.js'

type TypologizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('typologizability')
export class TypologizabilityController {
  constructor(
    private readonly typologizabilityAdminService: TypologizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.typologizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTypologizabilityRollout() {
    return this.typologizabilityAdminService.getTypologizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTypologizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.typologizabilityAdminService.getWorkspaceTypologizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTypologizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TypologizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_typologizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported typologizability admin action.',
      })
    }

    return this.typologizabilityAdminService.executeTypologizabilityAdminAction(
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
