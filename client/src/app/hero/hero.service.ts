import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private getHeroesGql = gql`
    {
      heroes {
        id
        no
        name
        salary
        description
        isTop
      }
    }
  `;
  private getTopHeroesGql = gql`
  {
    topHeroes {
      id
      no
      name
      salary
      description
      isTop
    }
  }
`;
  private getHeroGql = gql`
    query getHeroGql($id: String!) {
      hero(id: $id) {
        id
        no
        name
        salary
        description
        isTop
      }
    }
  `;
  private deleteHeroGql = gql`
    mutation deleteHeroGql($id: String!) {
      deleteHero(id: $id) {
        id
      }
    }
  `;
  private addHeroGql = gql`
    mutation addHeroGql(
      $no: String!
      $name: String!
      $salary: Float
      $description: String
      $isTop: Boolean
    ) {
      createHero(
        input: {
          no: $no
          name: $name
          salary: $salary
          description: $description
          isTop: $isTop
        }
      ) {
        id
      }
    }
  `;
  private updateHeroGql = gql`
    mutation updateHeroGql(
      $id: String!
      $no: String!
      $name: String!
      $salary: Float
      $description: String
      $isTop: Boolean
    ) {
      updateHero(
        id: $id,
        input: {
          no: $no
          name: $name
          salary: $salary
          description: $description
          isTop: $isTop
        }
      ) {
        id
      }
    }
  `;

  constructor(private apollo: Apollo) {}

  getHeroes() {
    return this.apollo.watchQuery<any>({
      query: this.getHeroesGql,
    }).valueChanges;
  }

  getTopHeroes() {
    return this.apollo.watchQuery<any>({
      query: this.getTopHeroesGql,
    }).valueChanges;
  }

  getHeroById(heroId: string) {
    return this.apollo.watchQuery<any>({
      query: this.getHeroGql,
      variables: { id: heroId }, // 带参数查询
    }).valueChanges;
  }

  deleteHero(heroId: string) {
    return this.apollo.mutate<any>({
      mutation: this.deleteHeroGql,
      variables: { id: heroId },
    });
  }

  addHero(hero: any) {
    return this.apollo.mutate<any>({
      mutation: this.addHeroGql,
      variables: {
        no: hero.no,
        name: hero.name,
        salary: hero.salary,
        description: hero.description,
        isTop: hero.isTop,
      },
    });
  }

  updateHero(heroId: string, hero: any) {
    return this.apollo.mutate<any>({
      mutation: this.updateHeroGql,
      variables: {
        id: heroId,
        no: hero.no,
        name: hero.name,
        salary: hero.salary,
        description: hero.description,
        isTop: hero.isTop,
      },
    });
  }
}
