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
import { BrokerizabilityAdminService } from './brokerizability-admin.service.js'

type BrokerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('brokerizability')
export class BrokerizabilityController {
  constructor(
    private readonly brokerizabilityAdminService: BrokerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.brokerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBrokerizabilityRollout() {
    return this.brokerizabilityAdminService.getBrokerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBrokerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.brokerizabilityAdminService.getWorkspaceBrokerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBrokerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BrokerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_brokerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported brokerizability admin action.',
      })
    }

    return this.brokerizabilityAdminService.executeBrokerizabilityAdminAction(
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
