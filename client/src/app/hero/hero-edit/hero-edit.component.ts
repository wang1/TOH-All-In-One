import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeroService } from '../hero.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../myErrorStateMatcher';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-hero-edit',
  templateUrl: './hero-edit.component.html',
  styleUrls: ['./hero-edit.component.scss'],
})
export class HeroEditComponent implements OnInit {
  heroForm: FormGroup;
  id = '';
  no = '';
  name = '';
  salary = 0;
  description = '';
  isTop = false;
  matcher = new MyErrorStateMatcher();
  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private heroService: HeroService,
    private formBuilder: FormBuilder,
    private location: Location,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.heroForm = this.formBuilder.group({
      no: ['', Validators.required],
      name: ['', Validators.required],
      salary: [0],
      description: [''],
      isTop: [false],
    });
    this.heroService
      .getHeroById(this.activatedRoute.snapshot.paramMap.get('id'))
      .subscribe(({ data }) => {
        this.id = data.hero.id;
        this.heroForm.setValue({
          no: data.hero.no,
          name: data.hero.name,
          salary: data.hero.salary,
          description: data.hero.description,
          isTop: data.hero.isTop,
        });
      });
  }

  onFormSubmit() {
    this.isLoading = true;
    this.heroService
      .updateHero(this.id, this.heroForm.value)
      .subscribe(({ data }) => {
        console.log(data);
        this.isLoading = false;
        this.snackBar.open(`${this.heroForm.value.name}保存成功!`, '关闭', {
          duration: 2000,
        });
        this.goBack();
      });
  }

  goBack() {
    this.location.back();
  }
}
