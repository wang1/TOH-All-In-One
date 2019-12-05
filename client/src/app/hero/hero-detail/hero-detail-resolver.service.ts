import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { HeroService } from '../hero.service';
import { of, Observable } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
// 实现 resolve() 方法。 该方法可以返回一个 Promise、一个 Observable 来支持异步方式，或者直接返回一个值来支持同步方式。
// heroService.getHeroById 方法返回一个可观察对象，以防止在数据获取完之前加载本路由。
// Router 守卫要求这个可观察对象必须可结束（complete），也就是说它已经发出了所有值。
// 你可以为 take 操作符传入一个参数 1，以确保这个可观察对象会在从 heroService.getHeroById 方法所返回的可观察对象中取到第一个值之后就会结束。
// 将取得的数据重新包装为Observable
export class HeroDetailResolverService implements Resolve<any> {
  constructor(private heroService: HeroService) {}
  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<any> {
    return this.heroService
      .getHeroById(activatedRouteSnapshot.paramMap.get('id'))
      .pipe(
        take(1),
        switchMap(data => of(data)),
      );
  }
}
