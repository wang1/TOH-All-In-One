import { Component, OnInit } from '@angular/core';
import { HeroService } from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
})
export class HeroListComponent implements OnInit {
  // 决定表格中要显示的列和顺序
  displayedColumns: string[] = ['no', 'name', 'salary', 'description', 'isTop'];
  heroes: Hero[] = [];
  isLoading = true;
  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.heroService.getHeroes().subscribe(result => {
      this.heroes = result.data && result.data.heroes;
      this.isLoading = result.loading;
      // if (result.errors) { this.isLoading = false; }
    });
  }
}
