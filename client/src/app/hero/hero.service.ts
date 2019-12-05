import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  // 我们用graphql-tag库中的gql标签将解析查询字符串为一个Grapqhal查询文档对象
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
  private getSomeHeroGql = gql`
    query getSomeHeroGql($termInName: String!) {
      searchHeroByName(stringInName: $termInName) {
        id
        name
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
        id: $id
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
  // The watchQuery method returns a QueryRef object which has the valueChanges property that is an Observable.
  // 由于apollo.watchQuery的valueChanges属性以及mutate返回的是一个Observable对象(该对象contains loading, error, and data properties),
  //  不能指定其类型, 故此处使用any类型
  // TODO: 在保证类型一致性方面需要再思考
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

  searchHeroesByName(term: string) {
    // if not search term, return empty data object.非常重要, 否则组件将阻塞
    if (!term.trim()) {
      return of({ data: {} });
    }
    return this.apollo.watchQuery<any>({
      query: this.getSomeHeroGql,
      variables: { termInName: term }, // 带参数查询
    }).valueChanges;
  }

  deleteHero(heroId: string) {
    return this.apollo.mutate<any>({
      mutation: this.deleteHeroGql,
      variables: { id: heroId },
      // 删除英雄后,使用refetchQueries执行查询以更新apollo的数据缓存,保证其它组件显示数据的正常
      refetchQueries: [{
        query: this.getHeroesGql,
      }],
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
      // 添加英雄后,使用refetchQueries执行查询以更新apollo的数据缓存, 保证其它组件显示数据的正常
      refetchQueries: [{
        query: this.getHeroesGql,
      }],
    });
  }
  // 更新英雄. 似乎它将自动更新apollo的数据缓存
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
