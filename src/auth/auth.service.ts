import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Auto-create super admin on first run
  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const existingAdmin = await this.usersService.findByEmail('admin@ceresense.com.ng');
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@2024', 10);
      
      await this.usersService.create({
        fullName: 'Super Admin',
        email: 'admin@ceresense.com.ng',
        password: hashedPassword,
        role: 'super_admin',
      });
      
      console.log('✅ Super admin created successfully!');
      console.log('📧 Email: admin@ceresense.com.ng');
      console.log('🔑 Password: Admin@2024');
    } else {
      console.log('✅ Super admin already exists');
    }
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return {
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken: token,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const { password, ...userWithoutPassword } = user;
    return { success: true, data: userWithoutPassword };
  }

  private generateToken(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      fullName: user.fullName
    };
    return this.jwtService.sign(payload);
  }
}