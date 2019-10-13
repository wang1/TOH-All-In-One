import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-top',
  templateUrl: './hero-top.component.html',
  styleUrls: ['./hero-top.component.scss'],
})
export class HeroTopComponent implements OnInit {
  topHeroes: any[];
  isLoading = true;
  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.heroService.getTopHeroes().subscribe(({ data }) => {
      this.topHeroes = data.topHeroes;
      this.isLoading = false;
    });
  }
}
