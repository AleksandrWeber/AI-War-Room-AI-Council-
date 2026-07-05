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
import { SubstantiabilityAdminService } from './substantiability-admin.service.js'

type SubstantiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('substantiability')
export class SubstantiabilityController {
  constructor(
    private readonly substantiabilityAdminService: SubstantiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.substantiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSubstantiabilityRollout() {
    return this.substantiabilityAdminService.getSubstantiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSubstantiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.substantiabilityAdminService.getWorkspaceSubstantiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSubstantiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SubstantiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_substantiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported substantiability admin action.',
      })
    }

    return this.substantiabilityAdminService.executeSubstantiabilityAdminAction(
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
