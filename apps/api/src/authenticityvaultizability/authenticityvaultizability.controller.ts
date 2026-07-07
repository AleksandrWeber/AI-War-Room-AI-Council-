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
import { AuthenticityvaultizabilityAdminService } from './authenticityvaultizability-admin.service.js'

type AuthenticityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('authenticityvaultizability')
export class AuthenticityvaultizabilityController {
  constructor(
    private readonly authenticityvaultizabilityAdminService: AuthenticityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.authenticityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuthenticityvaultizabilityRollout() {
    return this.authenticityvaultizabilityAdminService.getAuthenticityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuthenticityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.authenticityvaultizabilityAdminService.getWorkspaceAuthenticityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuthenticityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuthenticityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_authenticityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported authenticityvaultizability admin action.',
      })
    }

    return this.authenticityvaultizabilityAdminService.executeAuthenticityvaultizabilityAdminAction(
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
