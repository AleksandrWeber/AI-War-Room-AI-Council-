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
import { AssuranceizabilityAdminService } from './assuranceizability-admin.service.js'

type AssuranceizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('assuranceizability')
export class AssuranceizabilityController {
  constructor(
    private readonly assuranceizabilityAdminService: AssuranceizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.assuranceizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAssuranceizabilityRollout() {
    return this.assuranceizabilityAdminService.getAssuranceizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAssuranceizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.assuranceizabilityAdminService.getWorkspaceAssuranceizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAssuranceizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AssuranceizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_assuranceizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported assuranceizability admin action.',
      })
    }

    return this.assuranceizabilityAdminService.executeAssuranceizabilityAdminAction(
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
