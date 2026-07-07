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
import { SignatureproofizabilityAdminService } from './signatureproofizability-admin.service.js'

type SignatureproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('signatureproofizability')
export class SignatureproofizabilityController {
  constructor(
    private readonly signatureproofizabilityAdminService: SignatureproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.signatureproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSignatureproofizabilityRollout() {
    return this.signatureproofizabilityAdminService.getSignatureproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSignatureproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.signatureproofizabilityAdminService.getWorkspaceSignatureproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSignatureproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SignatureproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_signatureproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported signatureproofizability admin action.',
      })
    }

    return this.signatureproofizabilityAdminService.executeSignatureproofizabilityAdminAction(
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
