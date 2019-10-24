import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hero } from './hero.interface';
import { HeroInput } from './hero.input';

@Injectable()
export class HeroService {
  constructor(@InjectModel('HeroModel') private heroModel: Model<Hero>) {}

  async create(newHero: HeroInput): Promise<Hero> {
    return await this.heroModel(newHero).save();
  }

  async findAll(): Promise<Hero[]> {
    return await this.heroModel.find().exec();
  }

  async findOne(id: string): Promise<Hero> {
    return await this.heroModel.findOne({ _id: id });
  }

  async findTop(): Promise<Hero[]> {
    return await this.heroModel.find({ isTop: true });
  }

  async searchByName(stringInName: string): Promise<Hero[]> {
    return await this.heroModel.find({ name: new RegExp(stringInName) }, 'name');
  }

  async delete(id: string): Promise<Hero> {
    return await this.heroModel.findByIdAndRemove(id);
  }

  async update(id: string, updateHero: HeroInput): Promise<Hero> {
    return await this.heroModel.findByIdAndUpdate(id, updateHero, {
      new: true,
    });
  }
}
