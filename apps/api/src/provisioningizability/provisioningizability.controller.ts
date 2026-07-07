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
import { ProvisioningizabilityAdminService } from './provisioningizability-admin.service.js'

type ProvisioningizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('provisioningizability')
export class ProvisioningizabilityController {
  constructor(
    private readonly provisioningizabilityAdminService: ProvisioningizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.provisioningizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProvisioningizabilityRollout() {
    return this.provisioningizabilityAdminService.getProvisioningizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProvisioningizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.provisioningizabilityAdminService.getWorkspaceProvisioningizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProvisioningizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProvisioningizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_provisioningizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported provisioningizability admin action.',
      })
    }

    return this.provisioningizabilityAdminService.executeProvisioningizabilityAdminAction(
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
