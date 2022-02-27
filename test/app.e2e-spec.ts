import {Test} from '@nestjs/testing';
import {AppModule} from "../src/app.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import {AuthDto} from "../src/auth/dto";

describe('App e2e', () => {

  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async() => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {

    const dto: AuthDto = {
      email: 'signup@gmail.com',
      password: 'password123',
    };

    describe('Signup', () => {

      const failTest = (body?: any) => {
        return pactum.spec().post('/auth/signup').withBody(body).expectStatus(400);
      }

      it('Should throw exception if email empty', () => {
        failTest({ password: 'password123' });
      });

      it('Should throw exception if password empty', () => {
        failTest({ email: 'signup@gmail.com' });
      });

      it('Should throw exception if pno body provided', () => {
        failTest();
      });

      it('Should signup', () => {
        return pactum.spec().post('/auth/signup')
          .withBody(dto).expectStatus(201);
      });
    });

    describe('Login', () => {

      const failTest = (body?: any) => {
        return pactum.spec().post('/auth/login').withBody(body).expectStatus(400);
      }

      it('Should throw exception if email empty', () => {
        failTest({ password: 'password123' });
      });

      it('Should throw exception if password empty', () => {
        failTest({ email: 'signup@gmail.com' });
      });

      it('Should throw exception if pno body provided', () => {
        failTest();
      });

      it('Should login', () => {
        return pactum.spec().post('/auth/login')
          .withBody(dto).expectStatus(200).stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {

      it('Should get current user', () => {
        return pactum.spec().get('/users/me').withHeaders({
          Authorization: `Bearer $S{ userAt }`
        }).expectStatus(200);
      })
    });

    describe('Edit user', () => {

    });
  });

  describe('Bookmarks', () => {
    describe('Create', () => {

    });

    describe('Get bookmarks', () => {

    });

    describe('Get bookmark by id', () => {

    });

    describe('Edit bookmark', () => {

    });

    describe('Delete bookmark', () => {

    });
  });
});