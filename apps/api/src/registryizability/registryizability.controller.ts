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
import { RegistryizabilityAdminService } from './registryizability-admin.service.js'

type RegistryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('registryizability')
export class RegistryizabilityController {
  constructor(
    private readonly registryizabilityAdminService: RegistryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.registryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRegistryizabilityRollout() {
    return this.registryizabilityAdminService.getRegistryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRegistryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.registryizabilityAdminService.getWorkspaceRegistryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRegistryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RegistryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_registryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported registryizability admin action.',
      })
    }

    return this.registryizabilityAdminService.executeRegistryizabilityAdminAction(
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
