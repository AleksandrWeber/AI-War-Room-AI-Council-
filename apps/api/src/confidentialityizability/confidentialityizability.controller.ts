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
import { ConfidentialityizabilityAdminService } from './confidentialityizability-admin.service.js'

type ConfidentialityizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('confidentialityizability')
export class ConfidentialityizabilityController {
  constructor(
    private readonly confidentialityizabilityAdminService: ConfidentialityizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.confidentialityizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConfidentialityizabilityRollout() {
    return this.confidentialityizabilityAdminService.getConfidentialityizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConfidentialityizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.confidentialityizabilityAdminService.getWorkspaceConfidentialityizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConfidentialityizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConfidentialityizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_confidentialityizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported confidentialityizability admin action.',
      })
    }

    return this.confidentialityizabilityAdminService.executeConfidentialityizabilityAdminAction(
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
