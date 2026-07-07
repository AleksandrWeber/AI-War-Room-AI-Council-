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
import { SpecificationizabilityAdminService } from './specificationizability-admin.service.js'

type SpecificationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('specificationizability')
export class SpecificationizabilityController {
  constructor(
    private readonly specificationizabilityAdminService: SpecificationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.specificationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSpecificationizabilityRollout() {
    return this.specificationizabilityAdminService.getSpecificationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSpecificationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.specificationizabilityAdminService.getWorkspaceSpecificationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSpecificationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SpecificationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_specificationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported specificationizability admin action.',
      })
    }

    return this.specificationizabilityAdminService.executeSpecificationizabilityAdminAction(
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
