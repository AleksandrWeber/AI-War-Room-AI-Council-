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
import { BufferizabilityAdminService } from './bufferizability-admin.service.js'

type BufferizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('bufferizability')
export class BufferizabilityController {
  constructor(
    private readonly bufferizabilityAdminService: BufferizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.bufferizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBufferizabilityRollout() {
    return this.bufferizabilityAdminService.getBufferizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBufferizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.bufferizabilityAdminService.getWorkspaceBufferizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBufferizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BufferizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_bufferizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported bufferizability admin action.',
      })
    }

    return this.bufferizabilityAdminService.executeBufferizabilityAdminAction(
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
