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
import { ThesaurusizabilityAdminService } from './thesaurusizability-admin.service.js'

type ThesaurusizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('thesaurusizability')
export class ThesaurusizabilityController {
  constructor(
    private readonly thesaurusizabilityAdminService: ThesaurusizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.thesaurusizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getThesaurusizabilityRollout() {
    return this.thesaurusizabilityAdminService.getThesaurusizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceThesaurusizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.thesaurusizabilityAdminService.getWorkspaceThesaurusizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeThesaurusizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ThesaurusizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_thesaurusizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported thesaurusizability admin action.',
      })
    }

    return this.thesaurusizabilityAdminService.executeThesaurusizabilityAdminAction(
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
