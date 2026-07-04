import {
  Body,
  Controller,
  Delete,
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
import { ProviderCredentialsService } from './provider-credentials.service.js'

@Controller('provider-credentials')
@UseGuards(WorkspaceAccessGuard)
export class ProviderCredentialsController {
  constructor(
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {}

  @Get()
  listCredentials(@Req() request: AuthenticatedRequest) {
    return this.providerCredentialsService.listCredentials(request.authContext!)
  }

  @Post()
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
  testCredential(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
  ) {
    return this.providerCredentialsService.testCredential({
      authContext: request.authContext!,
      credentialId,
    })
  }
}
