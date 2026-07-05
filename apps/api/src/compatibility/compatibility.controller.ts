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
import { CompatibilityAdminService } from './compatibility-admin.service.js'

type CompatibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compatibility')
export class CompatibilityController {
  constructor(
    private readonly compatibilityAdminService: CompatibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compatibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompatibilityRollout() {
    return this.compatibilityAdminService.getCompatibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompatibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compatibilityAdminService.getWorkspaceCompatibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompatibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompatibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compatibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported compatibility admin action.',
      })
    }

    return this.compatibilityAdminService.executeCompatibilityAdminAction(
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
