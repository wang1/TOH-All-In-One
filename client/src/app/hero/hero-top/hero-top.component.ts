import { Component, OnInit } from '@angular/core';
import { HeroService } from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-top',
  templateUrl: './hero-top.component.html',
  styleUrls: ['./hero-top.component.scss'],
})
export class HeroTopComponent implements OnInit {
  topHeroes: Hero[] = [];
  isLoading = true;
  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.heroService.getTopHeroes().subscribe(({ data }) => {
      this.topHeroes = data.topHeroes;
      this.isLoading = false;
    });
  }
}
