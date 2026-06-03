import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private blogRepository: Repository<BlogPost>,
  ) {}

  async findAll(): Promise<BlogPost[]> {
    return this.blogRepository.find({
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    
    post.views += 1;
    await this.blogRepository.save(post);
    
    return post;
  }

  async create(createDto: Partial<BlogPost>, authorId: string): Promise<BlogPost> {
    const post = this.blogRepository.create({
      ...createDto,
      authorId,
    });
    return this.blogRepository.save(post);
  }

  async update(id: string, updateDto: Partial<BlogPost>): Promise<BlogPost> {
    await this.blogRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Blog post not found');
  }

  async like(id: string): Promise<BlogPost> {
    const post = await this.findById(id);
    post.likes += 1;
    return this.blogRepository.save(post);
  }
}