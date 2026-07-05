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
import { AssuranceAdminService } from './assurance-admin.service.js'

type AssuranceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('assurance')
export class AssuranceController {
  constructor(
    private readonly assuranceAdminService: AssuranceAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.assuranceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAssuranceRollout() {
    return this.assuranceAdminService.getAssuranceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAssuranceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.assuranceAdminService.getWorkspaceAssuranceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAssuranceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AssuranceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_assurance_summary') {
      throw new BadRequestException({
        message: 'Unsupported assurance admin action.',
      })
    }

    return this.assuranceAdminService.executeAssuranceAdminAction(
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
