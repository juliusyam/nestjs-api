import {Test} from '@nestjs/testing';
import {AppModule} from "../src/app.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import {AuthDto} from "../src/auth/dto";
import {EditUserDto} from "../src/user/dto";
import {CreateBookmarkDto, EditBookmarkDto} from "../src/bookmark/dto";

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
      email: 'signup5@gmail.com',
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
        failTest({ email: 'signup5@gmail.com' });
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
        failTest({ email: 'signup5@gmail.com' });
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

      it('Should edit user', () => {
        const dto: EditUserDto = {
          firstName: "Kimi",
          lastName: "Raikkonen"
        }

        return pactum.spec().patch('/users').withHeaders({
          Authorization: `Bearer $S{ userAt }`
        }).withBody(dto).expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {

    describe('Get empty bookmarks', () => {
      it('Should get bookmarks', () => {

        return pactum.spec().get('/bookmarks').withHeaders({
          Authorization: 'Bearer $S{ userAt }',
        }).expectBody([]).expectStatus(200);

      });
    });

    describe('Create', () => {
      it('Should create bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: "Bookmark 1",
          description: "Bookmark 1 description",
          link: "https://www.juliusyam.com",
        }

        return pactum.spec().post('/bookmarks').withHeaders({
            Authorization: `Bearer $S{ userAt }`,
          }).withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('Should get bookmarks', () => {

        return pactum.spec().get('/bookmarks').withHeaders({
          Authorization: 'Bearer $S{ userAt }',
        }).expectStatus(200);

      });
    });

    describe('Get bookmark by id', () => {

      it('Should get bookmark', () => {
        const dto: EditBookmarkDto = {
          title: "Bookmark 1 edited",
        }

        return pactum.spec().get('/bookmarks/{id}')
          .withPathParams('id', '$S{ bookmarkId }')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{ userAt }',
          })
          .expectStatus(200)
          .expectBodyContains('$S{ bookmarkId }');

      });
    });

    describe('Edit bookmark', () => {

      it('Should edit bookmark', () => {

        return pactum.spec().patch('/bookmarks/{id}')
          .withPathParams('id', '$S{ bookmarkId }')
          .withHeaders({
            Authorization: 'Bearer $S{ userAt }',
          })
          .expectStatus(200)
          .expectBodyContains('$S{ bookmarkId }');

      });
    });

    describe('Delete bookmark', () => {

      it('Should delete bookmark', () => {

        return pactum.spec().delete('/bookmarks/{id}')
          .withHeaders({
            Authorization: 'Bearer $S{ userAt }',
          })
          .expectStatus(204);

      });
    });
  });
});