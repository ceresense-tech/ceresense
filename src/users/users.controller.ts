import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Get all users (admin only)
  @Get()
  async findAll(@Request() req) {
    // Only super_admin can see all users
    if (req.user.role !== 'super_admin') {
      const user = await this.usersService.findById(req.user.id);
      return { success: true, data: [user] };
    }
    
    const users = await this.usersService.findAll();
    // Remove passwords from response
    const safeUsers = users.map(({ password, ...rest }) => rest);
    return { success: true, data: safeUsers };
  }

  // Get single user
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    // Only super_admin or the user themselves
    if (req.user.role !== 'super_admin' && req.user.id !== id) {
      return { success: false, message: 'Unauthorized' };
    }
    
    const user = await this.usersService.findById(id);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    const { password, ...safeUser } = user;
    return { success: true, data: safeUser };
  }

  // Create new user (super admin only)
  @Post()
  async create(@Body() createUserDto: { fullName: string; email: string; password: string; role?: string }, @Request() req) {
    // Only super_admin can create users
    if (req.user.role !== 'super_admin') {
      return { success: false, message: 'Only super admin can create users' };
    }

    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      return { success: false, message: 'Email already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'admin',
    });

    const { password, ...safeUser } = user;
    return { success: true, data: safeUser, message: 'User created successfully' };
  }

  // Update user
  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: { fullName?: string; email?: string; password?: string; role?: string },
    @Request() req
  ) {
    // Only super_admin or the user themselves
    if (req.user.role !== 'super_admin' && req.user.id !== id) {
      return { success: false, message: 'Unauthorized' };
    }

    const updateData: any = { ...updateUserDto };
    
    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Only super_admin can change role
    if (req.user.role !== 'super_admin') {
      delete updateData.role;
    }

    const user = await this.usersService.update(id, updateData);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const { password, ...safeUser } = user;
    return { success: true, data: safeUser, message: 'User updated successfully' };
  }

  // Delete user (super admin only)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // Only super_admin can delete users
    if (req.user.role !== 'super_admin') {
      return { success: false, message: 'Only super admin can delete users' };
    }

    // Cannot delete yourself
    if (req.user.id === id) {
      return { success: false, message: 'Cannot delete your own account' };
    }

    await this.usersService.remove(id);
    return { success: true, message: 'User deleted successfully' };
  }
}