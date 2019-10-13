import { InputType, Field, Float } from 'type-graphql';

@InputType()
export class HeroInput {
  @Field()
  readonly no: string;

  @Field()
  readonly name: string;

  @Field({ nullable: true })
  @Field(() => Float)
  readonly salary?: number;

  @Field({ nullable: true })
  readonly description?: string;

  @Field({ nullable: true })
  readonly isTop?: boolean;
}
