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
import { EntitlementizabilityAdminService } from './entitlementizability-admin.service.js'

type EntitlementizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('entitlementizability')
export class EntitlementizabilityController {
  constructor(
    private readonly entitlementizabilityAdminService: EntitlementizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.entitlementizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEntitlementizabilityRollout() {
    return this.entitlementizabilityAdminService.getEntitlementizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEntitlementizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.entitlementizabilityAdminService.getWorkspaceEntitlementizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEntitlementizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EntitlementizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_entitlementizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported entitlementizability admin action.',
      })
    }

    return this.entitlementizabilityAdminService.executeEntitlementizabilityAdminAction(
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
