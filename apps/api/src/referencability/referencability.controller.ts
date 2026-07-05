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
import { ReferencabilityAdminService } from './referencability-admin.service.js'

type ReferencabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('referencability')
export class ReferencabilityController {
  constructor(
    private readonly referencabilityAdminService: ReferencabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.referencabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReferencabilityRollout() {
    return this.referencabilityAdminService.getReferencabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReferencabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.referencabilityAdminService.getWorkspaceReferencabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReferencabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReferencabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_referencability_summary') {
      throw new BadRequestException({
        message: 'Unsupported referencability admin action.',
      })
    }

    return this.referencabilityAdminService.executeReferencabilityAdminAction(
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
