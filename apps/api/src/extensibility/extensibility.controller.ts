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
import { ExtensibilityAdminService } from './extensibility-admin.service.js'

type ExtensibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('extensibility')
export class ExtensibilityController {
  constructor(
    private readonly extensibilityAdminService: ExtensibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.extensibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExtensibilityRollout() {
    return this.extensibilityAdminService.getExtensibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExtensibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.extensibilityAdminService.getWorkspaceExtensibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExtensibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExtensibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_extensibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported extensibility admin action.',
      })
    }

    return this.extensibilityAdminService.executeExtensibilityAdminAction(
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
