import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostFilterDto } from './dto/post-filter.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: DatabaseService) {}

  async post(postWhereUniqueInput: { id: number }): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(filter: PostFilterDto): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = filter;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(data: CreatePostDto): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async updatePost(id: number, data: UpdatePostDto): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async deletePost(id: number): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
