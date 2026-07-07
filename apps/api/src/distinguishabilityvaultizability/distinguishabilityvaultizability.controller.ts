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
import { DistinguishabilityvaultizabilityAdminService } from './distinguishabilityvaultizability-admin.service.js'

type DistinguishabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('distinguishabilityvaultizability')
export class DistinguishabilityvaultizabilityController {
  constructor(
    private readonly distinguishabilityvaultizabilityAdminService: DistinguishabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.distinguishabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDistinguishabilityvaultizabilityRollout() {
    return this.distinguishabilityvaultizabilityAdminService.getDistinguishabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDistinguishabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.distinguishabilityvaultizabilityAdminService.getWorkspaceDistinguishabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDistinguishabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DistinguishabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_distinguishabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported distinguishabilityvaultizability admin action.',
      })
    }

    return this.distinguishabilityvaultizabilityAdminService.executeDistinguishabilityvaultizabilityAdminAction(
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
