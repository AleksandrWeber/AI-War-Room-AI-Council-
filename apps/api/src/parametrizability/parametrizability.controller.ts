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
import { ParametrizabilityAdminService } from './parametrizability-admin.service.js'

type ParametrizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('parametrizability')
export class ParametrizabilityController {
  constructor(
    private readonly parametrizabilityAdminService: ParametrizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.parametrizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getParametrizabilityRollout() {
    return this.parametrizabilityAdminService.getParametrizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceParametrizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.parametrizabilityAdminService.getWorkspaceParametrizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeParametrizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ParametrizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_parametrizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported parametrizability admin action.',
      })
    }

    return this.parametrizabilityAdminService.executeParametrizabilityAdminAction(
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
