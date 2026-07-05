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
import { VocabularizabilityAdminService } from './vocabularizability-admin.service.js'

type VocabularizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('vocabularizability')
export class VocabularizabilityController {
  constructor(
    private readonly vocabularizabilityAdminService: VocabularizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.vocabularizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getVocabularizabilityRollout() {
    return this.vocabularizabilityAdminService.getVocabularizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceVocabularizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.vocabularizabilityAdminService.getWorkspaceVocabularizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeVocabularizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: VocabularizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_vocabularizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported vocabularizability admin action.',
      })
    }

    return this.vocabularizabilityAdminService.executeVocabularizabilityAdminAction(
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
