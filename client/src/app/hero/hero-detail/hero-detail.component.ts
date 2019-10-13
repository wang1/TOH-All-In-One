import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroService } from '../hero.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss'],
})
export class HeroDetailComponent implements OnInit {
  hero: any;
  isLoading = true;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private heroService: HeroService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.heroService
      .getHeroById(this.activatedRoute.snapshot.paramMap.get('id'))
      .subscribe(({ data, loading }) => {
        this.hero = data.hero;
        this.isLoading = loading;
      });
  }

  deleteHero() {
    this.isLoading = true;
    this.heroService.deleteHero(this.hero.id).subscribe(
      ({ data }) => {
        this.isLoading = false;
        this.snackBar.open(`${this.hero.name}成功删除!`, '关闭', {
          duration: 2000,
        });
        this.router.navigate(['/hero-list']);
      },
      error => (this.isLoading = false),
    );
  }
}
