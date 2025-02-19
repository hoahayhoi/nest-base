import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
    imports: [],
    controllers: [PostsController],
    providers: [ PostService ]
})
export class PostsModule { }
