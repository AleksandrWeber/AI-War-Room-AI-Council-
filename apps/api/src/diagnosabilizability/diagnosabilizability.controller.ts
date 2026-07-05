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
import { DiagnosabilizabilityAdminService } from './diagnosabilizability-admin.service.js'

type DiagnosabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('diagnosabilizability')
export class DiagnosabilizabilityController {
  constructor(
    private readonly diagnosabilizabilityAdminService: DiagnosabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.diagnosabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDiagnosabilizabilityRollout() {
    return this.diagnosabilizabilityAdminService.getDiagnosabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDiagnosabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.diagnosabilizabilityAdminService.getWorkspaceDiagnosabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDiagnosabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DiagnosabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_diagnosabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported diagnosabilizability admin action.',
      })
    }

    return this.diagnosabilizabilityAdminService.executeDiagnosabilizabilityAdminAction(
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
