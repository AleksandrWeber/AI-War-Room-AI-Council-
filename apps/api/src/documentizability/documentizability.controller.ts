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
import { DocumentizabilityAdminService } from './documentizability-admin.service.js'

type DocumentizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('documentizability')
export class DocumentizabilityController {
  constructor(
    private readonly documentizabilityAdminService: DocumentizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.documentizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDocumentizabilityRollout() {
    return this.documentizabilityAdminService.getDocumentizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDocumentizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.documentizabilityAdminService.getWorkspaceDocumentizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDocumentizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DocumentizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_documentizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported documentizability admin action.',
      })
    }

    return this.documentizabilityAdminService.executeDocumentizabilityAdminAction(
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
