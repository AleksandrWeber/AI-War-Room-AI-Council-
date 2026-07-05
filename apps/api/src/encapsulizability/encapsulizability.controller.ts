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
import { EncapsulizabilityAdminService } from './encapsulizability-admin.service.js'

type EncapsulizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('encapsulizability')
export class EncapsulizabilityController {
  constructor(
    private readonly encapsulizabilityAdminService: EncapsulizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.encapsulizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEncapsulizabilityRollout() {
    return this.encapsulizabilityAdminService.getEncapsulizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEncapsulizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.encapsulizabilityAdminService.getWorkspaceEncapsulizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEncapsulizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EncapsulizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_encapsulizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported encapsulizability admin action.',
      })
    }

    return this.encapsulizabilityAdminService.executeEncapsulizabilityAdminAction(
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
