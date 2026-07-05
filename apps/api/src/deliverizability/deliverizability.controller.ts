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
import { DeliverizabilityAdminService } from './deliverizability-admin.service.js'

type DeliverizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('deliverizability')
export class DeliverizabilityController {
  constructor(
    private readonly deliverizabilityAdminService: DeliverizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.deliverizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeliverizabilityRollout() {
    return this.deliverizabilityAdminService.getDeliverizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeliverizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.deliverizabilityAdminService.getWorkspaceDeliverizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeliverizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeliverizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_deliverizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported deliverizability admin action.',
      })
    }

    return this.deliverizabilityAdminService.executeDeliverizabilityAdminAction(
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
