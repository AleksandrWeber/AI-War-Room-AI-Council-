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
import { RegistrarproofizabilityAdminService } from './registrarproofizability-admin.service.js'

type RegistrarproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('registrarproofizability')
export class RegistrarproofizabilityController {
  constructor(
    private readonly registrarproofizabilityAdminService: RegistrarproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.registrarproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRegistrarproofizabilityRollout() {
    return this.registrarproofizabilityAdminService.getRegistrarproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRegistrarproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.registrarproofizabilityAdminService.getWorkspaceRegistrarproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRegistrarproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RegistrarproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_registrarproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported registrarproofizability admin action.',
      })
    }

    return this.registrarproofizabilityAdminService.executeRegistrarproofizabilityAdminAction(
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
