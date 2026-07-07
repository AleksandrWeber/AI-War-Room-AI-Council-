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
import { RegistryjournalizabilityAdminService } from './registryjournalizability-admin.service.js'

type RegistryjournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('registryjournalizability')
export class RegistryjournalizabilityController {
  constructor(
    private readonly registryjournalizabilityAdminService: RegistryjournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.registryjournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRegistryjournalizabilityRollout() {
    return this.registryjournalizabilityAdminService.getRegistryjournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRegistryjournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.registryjournalizabilityAdminService.getWorkspaceRegistryjournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRegistryjournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RegistryjournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_registryjournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported registryjournalizability admin action.',
      })
    }

    return this.registryjournalizabilityAdminService.executeRegistryjournalizabilityAdminAction(
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
