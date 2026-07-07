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
import { IdentityizabilityAdminService } from './identityizability-admin.service.js'

type IdentityizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('identityizability')
export class IdentityizabilityController {
  constructor(
    private readonly identityizabilityAdminService: IdentityizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.identityizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIdentityizabilityRollout() {
    return this.identityizabilityAdminService.getIdentityizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIdentityizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.identityizabilityAdminService.getWorkspaceIdentityizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIdentityizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IdentityizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_identityizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported identityizability admin action.',
      })
    }

    return this.identityizabilityAdminService.executeIdentityizabilityAdminAction(
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
