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
import { CertificationizabilityAdminService } from './certificationizability-admin.service.js'

type CertificationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('certificationizability')
export class CertificationizabilityController {
  constructor(
    private readonly certificationizabilityAdminService: CertificationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.certificationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCertificationizabilityRollout() {
    return this.certificationizabilityAdminService.getCertificationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCertificationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.certificationizabilityAdminService.getWorkspaceCertificationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCertificationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CertificationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_certificationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported certificationizability admin action.',
      })
    }

    return this.certificationizabilityAdminService.executeCertificationizabilityAdminAction(
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
