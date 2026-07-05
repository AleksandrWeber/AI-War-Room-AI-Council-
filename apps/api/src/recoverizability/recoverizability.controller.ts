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
import { RecoverizabilityAdminService } from './recoverizability-admin.service.js'

type RecoverizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('recoverizability')
export class RecoverizabilityController {
  constructor(
    private readonly recoverizabilityAdminService: RecoverizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.recoverizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRecoverizabilityRollout() {
    return this.recoverizabilityAdminService.getRecoverizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRecoverizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.recoverizabilityAdminService.getWorkspaceRecoverizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRecoverizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RecoverizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_recoverizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported recoverizability admin action.',
      })
    }

    return this.recoverizabilityAdminService.executeRecoverizabilityAdminAction(
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
