import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {EditUserDto} from "./dto";
import {User} from "@prisma/client";

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) {
  }

  async editUser(user: User, dto: EditUserDto) {

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...user,
        ...dto,
      }
    });

    delete user.hash;

    return updatedUser;
  }
}
