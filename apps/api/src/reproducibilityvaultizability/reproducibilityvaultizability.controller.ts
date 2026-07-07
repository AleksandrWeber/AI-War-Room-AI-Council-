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
import { ReproducibilityvaultizabilityAdminService } from './reproducibilityvaultizability-admin.service.js'

type ReproducibilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('reproducibilityvaultizability')
export class ReproducibilityvaultizabilityController {
  constructor(
    private readonly reproducibilityvaultizabilityAdminService: ReproducibilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.reproducibilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReproducibilityvaultizabilityRollout() {
    return this.reproducibilityvaultizabilityAdminService.getReproducibilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReproducibilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.reproducibilityvaultizabilityAdminService.getWorkspaceReproducibilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReproducibilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReproducibilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_reproducibilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported reproducibilityvaultizability admin action.',
      })
    }

    return this.reproducibilityvaultizabilityAdminService.executeReproducibilityvaultizabilityAdminAction(
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
