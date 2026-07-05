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
import { ExtensibilizabilityAdminService } from './extensibilizability-admin.service.js'

type ExtensibilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('extensibilizability')
export class ExtensibilizabilityController {
  constructor(
    private readonly extensibilizabilityAdminService: ExtensibilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.extensibilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExtensibilizabilityRollout() {
    return this.extensibilizabilityAdminService.getExtensibilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExtensibilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.extensibilizabilityAdminService.getWorkspaceExtensibilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExtensibilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExtensibilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_extensibilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported extensibilizability admin action.',
      })
    }

    return this.extensibilizabilityAdminService.executeExtensibilizabilityAdminAction(
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
