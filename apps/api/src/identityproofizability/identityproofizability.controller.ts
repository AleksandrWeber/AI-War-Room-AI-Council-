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
import { IdentityproofizabilityAdminService } from './identityproofizability-admin.service.js'

type IdentityproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('identityproofizability')
export class IdentityproofizabilityController {
  constructor(
    private readonly identityproofizabilityAdminService: IdentityproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.identityproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIdentityproofizabilityRollout() {
    return this.identityproofizabilityAdminService.getIdentityproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIdentityproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.identityproofizabilityAdminService.getWorkspaceIdentityproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIdentityproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IdentityproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_identityproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported identityproofizability admin action.',
      })
    }

    return this.identityproofizabilityAdminService.executeIdentityproofizabilityAdminAction(
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
