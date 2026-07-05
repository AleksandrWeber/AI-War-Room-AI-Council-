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
import { SemanticizabilityAdminService } from './semanticizability-admin.service.js'

type SemanticizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('semanticizability')
export class SemanticizabilityController {
  constructor(
    private readonly semanticizabilityAdminService: SemanticizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.semanticizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSemanticizabilityRollout() {
    return this.semanticizabilityAdminService.getSemanticizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSemanticizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.semanticizabilityAdminService.getWorkspaceSemanticizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSemanticizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SemanticizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_semanticizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported semanticizability admin action.',
      })
    }

    return this.semanticizabilityAdminService.executeSemanticizabilityAdminAction(
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
