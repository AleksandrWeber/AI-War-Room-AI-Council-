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
import { ReadabilityAdminService } from './readability-admin.service.js'

type ReadabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('readability')
export class ReadabilityController {
  constructor(
    private readonly readabilityAdminService: ReadabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.readabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReadabilityRollout() {
    return this.readabilityAdminService.getReadabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReadabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.readabilityAdminService.getWorkspaceReadabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReadabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReadabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_readability_summary') {
      throw new BadRequestException({
        message: 'Unsupported readability admin action.',
      })
    }

    return this.readabilityAdminService.executeReadabilityAdminAction(
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
