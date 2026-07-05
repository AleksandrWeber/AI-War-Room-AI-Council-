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
import { TokenizabilityAdminService } from './tokenizability-admin.service.js'

type TokenizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('tokenizability')
export class TokenizabilityController {
  constructor(
    private readonly tokenizabilityAdminService: TokenizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.tokenizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTokenizabilityRollout() {
    return this.tokenizabilityAdminService.getTokenizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTokenizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.tokenizabilityAdminService.getWorkspaceTokenizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTokenizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TokenizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_tokenizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported tokenizability admin action.',
      })
    }

    return this.tokenizabilityAdminService.executeTokenizabilityAdminAction(
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
