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
import { AssurancevaultizabilityAdminService } from './assurancevaultizability-admin.service.js'

type AssurancevaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('assurancevaultizability')
export class AssurancevaultizabilityController {
  constructor(
    private readonly assurancevaultizabilityAdminService: AssurancevaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.assurancevaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAssurancevaultizabilityRollout() {
    return this.assurancevaultizabilityAdminService.getAssurancevaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAssurancevaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.assurancevaultizabilityAdminService.getWorkspaceAssurancevaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAssurancevaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AssurancevaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_assurancevaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported assurancevaultizability admin action.',
      })
    }

    return this.assurancevaultizabilityAdminService.executeAssurancevaultizabilityAdminAction(
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
