import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('create')
  async createContact(
    @Req() req: Request,
    @Body()
    body: {
      name: string;
      email: string;
      phoneNumber: string;
      postalAddress: string;
    },
  ) {
    const userId = req['user']?.sub;
    console.log('User ID from request:', userId); // Debug statement
    if (!userId) {
      throw new HttpException('User ID is missing', HttpStatus.UNAUTHORIZED);
    }

    const { name, email, phoneNumber, postalAddress } = body;
    return this.contactService.createContact(
      userId,
      name,
      email,
      phoneNumber,
      postalAddress,
    );
  }

  @Get('all')
  async getAllContacts(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const userId = req['user']?.sub;
    console.log('User ID from request:', userId);
    if (!userId) {
      throw new HttpException('User ID is missing', HttpStatus.UNAUTHORIZED);
    }

    return this.contactService.getContacts(userId, page, limit);
  }

  @Get('search')
  async searchContacts(@Req() req: Request, @Query('term') searchTerm: string) {
    const userId = req['user']?.sub;
    console.log('User ID from request:', userId); // just for fix errors
    if (!userId) {
      throw new HttpException('User ID is missing', HttpStatus.UNAUTHORIZED);
    }

    return this.contactService.searchContacts(userId, searchTerm);
  }
}
