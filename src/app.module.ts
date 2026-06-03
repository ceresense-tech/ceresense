import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BlogModule } from './blog/blog.module';
import { GalleryModule } from './gallery/gallery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        return {
          type: 'postgres',
          url: databaseUrl,
          ssl: {
            rejectUnauthorized: false, // Required for Neon
          },
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true, // Creates tables automatically
          autoLoadEntities: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    BlogModule,
    GalleryModule,
  ],
})
export class AppModule {}