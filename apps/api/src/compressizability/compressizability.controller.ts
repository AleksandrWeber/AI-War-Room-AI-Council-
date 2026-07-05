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
import { CompressizabilityAdminService } from './compressizability-admin.service.js'

type CompressizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compressizability')
export class CompressizabilityController {
  constructor(
    private readonly compressizabilityAdminService: CompressizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compressizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompressizabilityRollout() {
    return this.compressizabilityAdminService.getCompressizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompressizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compressizabilityAdminService.getWorkspaceCompressizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompressizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompressizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compressizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compressizability admin action.',
      })
    }

    return this.compressizabilityAdminService.executeCompressizabilityAdminAction(
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
