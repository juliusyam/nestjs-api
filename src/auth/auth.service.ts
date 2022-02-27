import {ForbiddenException, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {AuthDto} from "./dto";
import * as argon from 'argon2';
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {User} from "@prisma/client";

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService) {
  }

  async signup(dto: AuthDto): Promise<{ user: User, access_token: String }> {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    try {

      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;

      // return the saved user
      const accessToken = await this.signToken(user.id, user.email);

      return { user, access_token: accessToken };

    } catch(err) {

      if(err instanceof PrismaClientKnownRequestError) {

        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw err;
    }
  }

  async login(dto: AuthDto): Promise<{ user: User, access_token: String }> {

    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      }
    });

    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password)

    // if incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    delete user.hash;

    const accessToken = await this.signToken(user.id, user.email);

    return { user, access_token: accessToken };
  }

  signToken(userId: number, email: string): Promise<String> {

    const payload = {
      sub: userId,
      email,
    }

    const secret = this.config.get('JWT_SECRET');

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    })
  }
}
