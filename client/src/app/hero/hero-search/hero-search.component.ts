import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HeroService } from '../hero.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.scss'],
})
export class HeroSearchComponent implements OnInit {
  // heroes: Hero[] = [];
  heroes: Observable<any>;
  // Subject 既是可观察对象的数据源，本身也是 Observable。
  // 你可以像订阅任何 Observable 一样订阅 Subject。
  // 你还可以通过调用它的 next(value) 方法往 Observable 中推送一些值

  private searchTerms = new Subject<string>();

  constructor(private heroService: HeroService) {}
  // 每当用户在文本框中输入时，这个事件绑定就会使用文本框的值（搜索词）调用 search() 函数。
  // searchTerms 变成了一个能发出搜索词的稳定的流。
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit() {
    // 如果每当用户击键后就直接调用 heroService.searchHeroesByName将导致创建海量的 HTTP 请求，浪费服务器资源并消耗大量网络流量。
    // 往 searchTerms 这个可观察对象的处理管道中加入了一系列 RxJS 操作符, 缩减对 heroService.searchHeroesByName 的调用次数
    this.heroes = this.searchTerms
      .pipe(
        // 在传出最终字符串之前，debounceTime(300) 将会等待，直到新增字符串的事件暂停了 300 毫秒
        debounceTime(300),
        // 确保只在过滤词变化时才发送请求
        distinctUntilChanged(),
        // 为每个从 debounce 和 distinctUntilChanged 中通过的搜索词调用搜索服务。
        // 它会取消并丢弃以前的搜索可观察对象，只保留最近的
        switchMap((term: string) => this.heroService.searchHeroesByName(term)),
      );
      // .subscribe(({ data }) => this.heroes = data && data.searchHeroByName);
  }
}
