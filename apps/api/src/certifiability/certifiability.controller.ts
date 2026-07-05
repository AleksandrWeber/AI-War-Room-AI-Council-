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
import { CertifiabilityAdminService } from './certifiability-admin.service.js'

type CertifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('certifiability')
export class CertifiabilityController {
  constructor(
    private readonly certifiabilityAdminService: CertifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.certifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCertifiabilityRollout() {
    return this.certifiabilityAdminService.getCertifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCertifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.certifiabilityAdminService.getWorkspaceCertifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCertifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CertifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_certifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported certifiability admin action.',
      })
    }

    return this.certifiabilityAdminService.executeCertifiabilityAdminAction(
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
