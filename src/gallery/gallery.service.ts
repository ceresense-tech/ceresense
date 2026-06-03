import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryImage } from './gallery.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryImage)
    private galleryRepository: Repository<GalleryImage>,
  ) {}

  async findAll(): Promise<GalleryImage[]> {
    return this.galleryRepository.find({
      relations: { uploadedBy: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<GalleryImage> {
    const image = await this.galleryRepository.findOne({
      where: { id },
      relations: { uploadedBy: true },
    });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async create(createDto: Partial<GalleryImage>, userId: string): Promise<GalleryImage> {
    const image = this.galleryRepository.create({
      ...createDto,
      uploadedById: userId,
    });
    return this.galleryRepository.save(image);
  }

  async update(id: string, updateDto: Partial<GalleryImage>): Promise<GalleryImage> {
    await this.galleryRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.galleryRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Image not found');
  }

  async incrementViews(id: string): Promise<GalleryImage> {
    const image = await this.findById(id);
    image.views += 1;
    return this.galleryRepository.save(image);
  }

  async incrementDownloads(id: string): Promise<GalleryImage> {
    const image = await this.findById(id);
    image.downloads += 1;
    return this.galleryRepository.save(image);
  }

  async toggleFeatured(id: string): Promise<GalleryImage> {
    const image = await this.findById(id);
    image.featured = !image.featured;
    return this.galleryRepository.save(image);
  }
}