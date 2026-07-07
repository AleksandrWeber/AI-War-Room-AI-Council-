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
import { WitnessledgerizabilityAdminService } from './witnessledgerizability-admin.service.js'

type WitnessledgerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('witnessledgerizability')
export class WitnessledgerizabilityController {
  constructor(
    private readonly witnessledgerizabilityAdminService: WitnessledgerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.witnessledgerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWitnessledgerizabilityRollout() {
    return this.witnessledgerizabilityAdminService.getWitnessledgerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWitnessledgerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.witnessledgerizabilityAdminService.getWorkspaceWitnessledgerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWitnessledgerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WitnessledgerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_witnessledgerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported witnessledgerizability admin action.',
      })
    }

    return this.witnessledgerizabilityAdminService.executeWitnessledgerizabilityAdminAction(
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
