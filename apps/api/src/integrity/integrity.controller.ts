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
import { IntegrityAdminService } from './integrity-admin.service.js'

type IntegrityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('integrity')
export class IntegrityController {
  constructor(private readonly integrityAdminService: IntegrityAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.integrityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIntegrityRollout() {
    return this.integrityAdminService.getIntegrityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIntegrityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.integrityAdminService.getWorkspaceIntegrityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIntegrityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IntegrityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_integrity_summary') {
      throw new BadRequestException({
        message: 'Unsupported integrity admin action.',
      })
    }

    return this.integrityAdminService.executeIntegrityAdminAction(
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
