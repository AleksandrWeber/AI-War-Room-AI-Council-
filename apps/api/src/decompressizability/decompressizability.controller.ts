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
import { DecompressizabilityAdminService } from './decompressizability-admin.service.js'

type DecompressizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('decompressizability')
export class DecompressizabilityController {
  constructor(
    private readonly decompressizabilityAdminService: DecompressizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.decompressizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDecompressizabilityRollout() {
    return this.decompressizabilityAdminService.getDecompressizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDecompressizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.decompressizabilityAdminService.getWorkspaceDecompressizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDecompressizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DecompressizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_decompressizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported decompressizability admin action.',
      })
    }

    return this.decompressizabilityAdminService.executeDecompressizabilityAdminAction(
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
