import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../hero.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { MyErrorStateMatcher } from '../myErrorStateMatcher';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hero-add',
  templateUrl: './hero-add.component.html',
  styleUrls: ['./hero-add.component.scss'],
})
export class HeroAddComponent implements OnInit {
  heroForm: FormGroup;
  no = '';
  name = '';
  salary = 0;
  description = '';
  isTop = false;
  matcher = new MyErrorStateMatcher();
  isLoading = false;
  constructor(
    private router: Router,
    private heroService: HeroService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private location: Location,
  ) {}

  ngOnInit() {
    this.heroForm = this.formBuilder.group({
      no: ['', Validators.required],
      name: ['', Validators.required],
      salary: [0],
      description: [''],
      isTop: [false],
    });
  }

  onFormSubmit() {
    this.isLoading = true;
    this.heroService.addHero(this.heroForm.value).subscribe(({ data }) => {
      this.isLoading = false;
      this.snackBar.open(`${this.heroForm.value.name}添加成功!`, '关闭', {
        duration: 2000,
      });
      this.router.navigate(['/hero-detail', data.createHero.id]);
    });
  }

  goBack() {
    this.location.back();
  }
}
