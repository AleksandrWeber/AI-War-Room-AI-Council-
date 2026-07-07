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
import { SecretmanagementizabilityAdminService } from './secretmanagementizability-admin.service.js'

type SecretmanagementizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('secretmanagementizability')
export class SecretmanagementizabilityController {
  constructor(
    private readonly secretmanagementizabilityAdminService: SecretmanagementizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.secretmanagementizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSecretmanagementizabilityRollout() {
    return this.secretmanagementizabilityAdminService.getSecretmanagementizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSecretmanagementizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.secretmanagementizabilityAdminService.getWorkspaceSecretmanagementizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSecretmanagementizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SecretmanagementizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_secretmanagementizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported secretmanagementizability admin action.',
      })
    }

    return this.secretmanagementizabilityAdminService.executeSecretmanagementizabilityAdminAction(
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
