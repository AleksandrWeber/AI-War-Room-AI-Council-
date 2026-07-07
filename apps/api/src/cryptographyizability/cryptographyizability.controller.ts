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
import { CryptographyizabilityAdminService } from './cryptographyizability-admin.service.js'

type CryptographyizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('cryptographyizability')
export class CryptographyizabilityController {
  constructor(
    private readonly cryptographyizabilityAdminService: CryptographyizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.cryptographyizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCryptographyizabilityRollout() {
    return this.cryptographyizabilityAdminService.getCryptographyizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCryptographyizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.cryptographyizabilityAdminService.getWorkspaceCryptographyizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCryptographyizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CryptographyizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_cryptographyizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported cryptographyizability admin action.',
      })
    }

    return this.cryptographyizabilityAdminService.executeCryptographyizabilityAdminAction(
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
