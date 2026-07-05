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
import { ConformanceAdminService } from './conformance-admin.service.js'

type ConformanceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('conformance')
export class ConformanceController {
  constructor(
    private readonly conformanceAdminService: ConformanceAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.conformanceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConformanceRollout() {
    return this.conformanceAdminService.getConformanceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConformanceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.conformanceAdminService.getWorkspaceConformanceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConformanceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConformanceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_conformance_summary') {
      throw new BadRequestException({
        message: 'Unsupported conformance admin action.',
      })
    }

    return this.conformanceAdminService.executeConformanceAdminAction(
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
