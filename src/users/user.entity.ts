import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BlogPost } from '../blog/blog.entity';
import { GalleryImage } from '../gallery/gallery.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ default: 'admin' })
  role!: string;

  @Column({ nullable: true })
  avatar!: string;

  @OneToMany(() => BlogPost, (post) => post.author)
  posts!: BlogPost[];

  @OneToMany(() => GalleryImage, (image) => image.uploadedBy)
  images!: GalleryImage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}