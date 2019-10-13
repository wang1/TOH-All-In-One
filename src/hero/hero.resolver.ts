import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { HeroService } from './hero.service';
import { HeroDto } from './hero.dto';
import { HeroInput } from './hero.input';

@Resolver('Hero')
export class HeroResolver {
  constructor(private readonly heroService: HeroService) {}

  @Query(() => [HeroDto])
  async heroes() {
    return this.heroService.findAll();
  }

  @Query(() => [HeroDto])
  async topHeroes() {
    return this.heroService.findTop();
  }

  @Query(() => HeroDto)
  async hero(@Args('id') id: string) {
    return this.heroService.findOne(id);
  }

  @Mutation(() => HeroDto)
  async createHero(@Args('input') input: HeroInput) {
    return this.heroService.create(input);
  }

  @Mutation(() => HeroDto)
  async updateHero(@Args('id') id: string, @Args('input') input: HeroInput) {
    return this.heroService.update(id, input);
  }

  @Mutation(() => HeroDto)
  async deleteHero(@Args('id') id: string) {
    return this.heroService.delete(id);
  }
}
