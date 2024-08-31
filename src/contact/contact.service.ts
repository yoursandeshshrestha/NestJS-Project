import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async createContact(
    user: User,
    name: string,
    email: string,
    phoneNumber: string,
    postalAddress: string,
  ): Promise<Contact> {
    const contact = this.contactRepository.create({
      name,
      email,
      phoneNumber,
      postalAddress,
      user,
    });
    return this.contactRepository.save(contact);
  }

  async getContacts(
    user: User,
    page: number = 1,
    limit: number = 10,
  ): Promise<Contact[]> {
    const skip = (page - 1) * limit;
    return this.contactRepository.find({
      where: { user: { id: user.id } },
      skip,
      take: limit,
    });
  }

  async searchContacts(userId: string, searchTerm: string): Promise<Contact[]> {
    console.log('Searching contacts for userId:', userId); // Debug statement
    return this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.user.id = :userId', { userId })
      .andWhere(
        '(contact.name LIKE :searchTerm OR contact.phoneNumber LIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .getMany();
  }
}
