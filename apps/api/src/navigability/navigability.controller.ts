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
import { NavigabilityAdminService } from './navigability-admin.service.js'

type NavigabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('navigability')
export class NavigabilityController {
  constructor(
    private readonly navigabilityAdminService: NavigabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.navigabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNavigabilityRollout() {
    return this.navigabilityAdminService.getNavigabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNavigabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.navigabilityAdminService.getWorkspaceNavigabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNavigabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NavigabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_navigability_summary') {
      throw new BadRequestException({
        message: 'Unsupported navigability admin action.',
      })
    }

    return this.navigabilityAdminService.executeNavigabilityAdminAction(
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
