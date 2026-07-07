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
import { AccesscontrolizabilityAdminService } from './accesscontrolizability-admin.service.js'

type AccesscontrolizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('accesscontrolizability')
export class AccesscontrolizabilityController {
  constructor(
    private readonly accesscontrolizabilityAdminService: AccesscontrolizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.accesscontrolizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAccesscontrolizabilityRollout() {
    return this.accesscontrolizabilityAdminService.getAccesscontrolizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAccesscontrolizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.accesscontrolizabilityAdminService.getWorkspaceAccesscontrolizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAccesscontrolizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AccesscontrolizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_accesscontrolizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported accesscontrolizability admin action.',
      })
    }

    return this.accesscontrolizabilityAdminService.executeAccesscontrolizabilityAdminAction(
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
