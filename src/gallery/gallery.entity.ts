import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('gallery_images')
export class GalleryImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  imageUrl!: string;

  @Column({ default: 'workshops' })
  category!: string;

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @Column({ default: false })
  featured!: boolean;

  @Column({ default: 'active' })
  status!: string;

  @Column({ default: 0 })
  views!: number;

  @Column({ default: 0 })
  downloads!: number;
    
  @ManyToOne(() => User, (user) => user.images)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy!: User;

  @Column()
  uploadedById!: string;

  @CreateDateColumn()
  createdAt!: Date;
}