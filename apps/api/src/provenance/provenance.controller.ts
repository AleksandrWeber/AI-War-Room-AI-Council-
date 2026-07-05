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
import { ProvenanceAdminService } from './provenance-admin.service.js'

type ProvenanceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('provenance')
export class ProvenanceController {
  constructor(
    private readonly provenanceAdminService: ProvenanceAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.provenanceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProvenanceRollout() {
    return this.provenanceAdminService.getProvenanceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProvenanceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.provenanceAdminService.getWorkspaceProvenanceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProvenanceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProvenanceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_provenance_summary') {
      throw new BadRequestException({
        message: 'Unsupported provenance admin action.',
      })
    }

    return this.provenanceAdminService.executeProvenanceAdminAction(
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
