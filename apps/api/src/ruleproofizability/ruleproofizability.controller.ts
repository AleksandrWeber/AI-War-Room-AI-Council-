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
import { RuleproofizabilityAdminService } from './ruleproofizability-admin.service.js'

type RuleproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('ruleproofizability')
export class RuleproofizabilityController {
  constructor(
    private readonly ruleproofizabilityAdminService: RuleproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.ruleproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRuleproofizabilityRollout() {
    return this.ruleproofizabilityAdminService.getRuleproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRuleproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.ruleproofizabilityAdminService.getWorkspaceRuleproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRuleproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RuleproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_ruleproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported ruleproofizability admin action.',
      })
    }

    return this.ruleproofizabilityAdminService.executeRuleproofizabilityAdminAction(
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
