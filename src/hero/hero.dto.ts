import { ObjectType, Field, ID, Float } from 'type-graphql';
import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

@ObjectType()
export class HeroDto {
  @Field(() => ID)
  @IsString()
  readonly id?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @Field({ nullable: true })
  @Field(() => Float)
  @IsNumber()
  readonly salary?: number;

  @Field({ nullable: true })
  @IsString()
  readonly description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  readonly isTop?: boolean;
}
