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
import { RegistryvaultizabilityAdminService } from './registryvaultizability-admin.service.js'

type RegistryvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('registryvaultizability')
export class RegistryvaultizabilityController {
  constructor(
    private readonly registryvaultizabilityAdminService: RegistryvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.registryvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRegistryvaultizabilityRollout() {
    return this.registryvaultizabilityAdminService.getRegistryvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRegistryvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.registryvaultizabilityAdminService.getWorkspaceRegistryvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRegistryvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RegistryvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_registryvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported registryvaultizability admin action.',
      })
    }

    return this.registryvaultizabilityAdminService.executeRegistryvaultizabilityAdminAction(
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
