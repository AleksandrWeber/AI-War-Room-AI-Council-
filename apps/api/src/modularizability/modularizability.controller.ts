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
import { ModularizabilityAdminService } from './modularizability-admin.service.js'

type ModularizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('modularizability')
export class ModularizabilityController {
  constructor(
    private readonly modularizabilityAdminService: ModularizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.modularizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getModularizabilityRollout() {
    return this.modularizabilityAdminService.getModularizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceModularizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.modularizabilityAdminService.getWorkspaceModularizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeModularizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ModularizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_modularizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported modularizability admin action.',
      })
    }

    return this.modularizabilityAdminService.executeModularizabilityAdminAction(
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
