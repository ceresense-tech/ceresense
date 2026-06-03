import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  async findAll() {
    const posts = await this.blogService.findAll();
    return { success: true, data: posts };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const post = await this.blogService.findById(id);
    return { success: true, data: post };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: any, @Request() req) {
    const post = await this.blogService.create(createDto, req.user.id);
    return { success: true, data: post };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    const post = await this.blogService.update(id, updateDto);
    return { success: true, data: post };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.blogService.remove(id);
    return { success: true, message: 'Post deleted successfully' };
  }

  @Post(':id/like')
  async like(@Param('id') id: string) {
    const post = await this.blogService.like(id);
    return { success: true, data: post };
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/blog',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadCover(@UploadedFile() file: Express.Multer.File) {
    return {
      success: true,
      data: { url: `/uploads/blog/${file.filename}` },
    };
  }
}