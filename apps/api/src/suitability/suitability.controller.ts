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
import { SuitabilityAdminService } from './suitability-admin.service.js'

type SuitabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('suitability')
export class SuitabilityController {
  constructor(
    private readonly suitabilityAdminService: SuitabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.suitabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSuitabilityRollout() {
    return this.suitabilityAdminService.getSuitabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSuitabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.suitabilityAdminService.getWorkspaceSuitabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSuitabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SuitabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_suitability_summary') {
      throw new BadRequestException({
        message: 'Unsupported suitability admin action.',
      })
    }

    return this.suitabilityAdminService.executeSuitabilityAdminAction(
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
