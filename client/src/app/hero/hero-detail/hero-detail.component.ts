import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeroService } from '../hero.service';
import { MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss'],
})
export class HeroDetailComponent implements OnInit {
  // 以前生成空的Hero对象, 否则由于取数据的延迟, 可能导致undefined错误
  // 现在使用resolve方式, 不存在该问题了
  hero: Hero;
  isLoading = true;
  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private heroService: HeroService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ result }) => {
      this.hero = result.data.hero;
      this.isLoading = result.loading;
    });
  }

  deleteHero() {
    this.isLoading = true;
    this.heroService.deleteHero(this.hero.id).subscribe(() => {
      this.isLoading = false;
      this.snackBar.open(`${this.hero.name}成功删除!`, '关闭', {
        duration: 2000,
      });
      this.location.back();
    });
  }
}
