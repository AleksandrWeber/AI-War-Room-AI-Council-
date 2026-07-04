import {
  Body,
  Controller,
  BadRequestException,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { UpsertProviderCredentialRequest } from '@ai-war-room/schemas'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { ProviderCredentialsAdminService } from './provider-credentials-admin.service.js'
import { ProviderCredentialsService } from './provider-credentials.service.js'

type ProviderKeyAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('provider-credentials')
export class ProviderCredentialsController {
  constructor(
    private readonly providerCredentialsService: ProviderCredentialsService,
    private readonly providerCredentialsAdminService: ProviderCredentialsAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.providerCredentialsAdminService.getCapabilities()
  }

  @Get('readiness')
  getProviderCredentialsRollout() {
    return this.providerCredentialsAdminService.getProviderCredentialsRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceProviderKeyAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.providerCredentialsAdminService.getWorkspaceProviderKeyAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeProviderKeyAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProviderKeyAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (
      action !== 'test_all_credentials' &&
      action !== 'retest_failed_credentials'
    ) {
      throw new BadRequestException({
        message: 'Unsupported provider key admin action.',
      })
    }

    return this.providerCredentialsAdminService.executeProviderKeyAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
  }

  @Get()
  @UseGuards(WorkspaceAccessGuard)
  listCredentials(@Req() request: AuthenticatedRequest) {
    return this.providerCredentialsService.listCredentials(request.authContext!)
  }

  @Post()
  @UseGuards(WorkspaceAccessGuard)
  createCredential(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpsertProviderCredentialRequest,
  ) {
    return this.providerCredentialsService.upsertCredential({
      authContext: request.authContext!,
      payload: body,
    })
  }

  @Put(':credentialId')
  @UseGuards(WorkspaceAccessGuard)
  updateCredential(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
    @Body() body: UpsertProviderCredentialRequest,
  ) {
    return this.providerCredentialsService.upsertCredential({
      authContext: request.authContext!,
      payload: body,
      credentialId,
    })
  }

  @Delete(':credentialId')
  @UseGuards(WorkspaceAccessGuard)
  deleteCredential(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
  ) {
    return this.providerCredentialsService.deleteCredential({
      authContext: request.authContext!,
      credentialId,
    })
  }

  @Post(':credentialId/test')
  @UseGuards(WorkspaceAccessGuard)
  testCredential(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
  ) {
    return this.providerCredentialsService.testCredential({
      authContext: request.authContext!,
      credentialId,
    })
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
