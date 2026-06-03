import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, UseGuards, Request,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get()
  async findAll() {
    const images = await this.galleryService.findAll();
    return { success: true, data: images };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const image = await this.galleryService.findById(id);
    return { success: true, data: image };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/gallery',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: any,
    @Request() req,
  ) {
    const imageUrl = file ? `/uploads/gallery/${file.filename}` : createDto.imageUrl;
    const image = await this.galleryService.create(
      { ...createDto, imageUrl },
      req.user.id,
    );
    return { success: true, data: image };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    const image = await this.galleryService.update(id, updateDto);
    return { success: true, data: image };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.galleryService.remove(id);
    return { success: true, message: 'Image deleted successfully' };
  }

  @Post(':id/view')
  async incrementViews(@Param('id') id: string) {
    const image = await this.galleryService.incrementViews(id);
    return { success: true, data: image };
  }

  @Post(':id/download')
  async incrementDownloads(@Param('id') id: string) {
    const image = await this.galleryService.incrementDownloads(id);
    return { success: true, data: image };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/featured')
  async toggleFeatured(@Param('id') id: string) {
    const image = await this.galleryService.toggleFeatured(id);
    return { success: true, data: image };
  }
}