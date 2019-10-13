import { Module } from '@nestjs/common';
import { HeroService } from './hero.service';
import { HeroResolver } from './hero.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroSchema } from './hero.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'HeroModel', schema: HeroSchema }]),
  ],
  providers: [HeroService, HeroResolver],
})
export class HeroModule {}
