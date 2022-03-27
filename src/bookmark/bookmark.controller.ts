import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {JwtGuard} from "../auth/guard";
import {BookmarkService} from "./bookmark.service";
import {GetUser} from "../auth/decorator";
import {CreateBookmarkDto, EditBookmarkDto} from "./dto";
import {User} from "@prisma/client";

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {

  constructor(private bookmarkService: BookmarkService) {
  }

  @Get()
  getBookmarks(@GetUser('id') user: User) {
    return this.bookmarkService.getBookmarks(user.id);
  }

  @Get(':id')
  getBookmarkById(@GetUser('id') user: User, @Param('id', ParseIntPipe) bookmarkId: number) {
    return this.bookmarkService.getBookmarkById(user.id, bookmarkId);
  }

  @Post()
  createBookmark(@GetUser('id') user: User, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.createBookmark(user.id, dto);
  }

  @Patch(':id')
  editBookmarkById(@GetUser('id') user: User, @Param('id', ParseIntPipe) bookmarkId: number, @Body() dto: EditBookmarkDto) {
    return this.bookmarkService.editBookmarkById(user.id, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(@GetUser('id') user: User, @Param('id', ParseIntPipe) bookmarkId: number) {
    return this.bookmarkService.deleteBookmarkById(user.id, bookmarkId);
  }
}
