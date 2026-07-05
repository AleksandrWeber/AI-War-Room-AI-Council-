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
import { RecoverabilityAdminService } from './recoverability-admin.service.js'

type RecoverabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('recoverability')
export class RecoverabilityController {
  constructor(
    private readonly recoverabilityAdminService: RecoverabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.recoverabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRecoverabilityRollout() {
    return this.recoverabilityAdminService.getRecoverabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRecoverabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.recoverabilityAdminService.getWorkspaceRecoverabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRecoverabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RecoverabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_recoverability_summary') {
      throw new BadRequestException({
        message: 'Unsupported recoverability admin action.',
      })
    }

    return this.recoverabilityAdminService.executeRecoverabilityAdminAction(
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
