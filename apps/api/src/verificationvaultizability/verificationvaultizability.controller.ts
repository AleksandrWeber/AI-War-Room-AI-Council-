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
import { VerificationvaultizabilityAdminService } from './verificationvaultizability-admin.service.js'

type VerificationvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('verificationvaultizability')
export class VerificationvaultizabilityController {
  constructor(
    private readonly verificationvaultizabilityAdminService: VerificationvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.verificationvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getVerificationvaultizabilityRollout() {
    return this.verificationvaultizabilityAdminService.getVerificationvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceVerificationvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.verificationvaultizabilityAdminService.getWorkspaceVerificationvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeVerificationvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: VerificationvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_verificationvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported verificationvaultizability admin action.',
      })
    }

    return this.verificationvaultizabilityAdminService.executeVerificationvaultizabilityAdminAction(
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
