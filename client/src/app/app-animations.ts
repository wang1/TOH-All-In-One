import {
  trigger,
  transition,
  style,
  query,
  animateChild,
  group,
  animate,
  keyframes,
} from '@angular/animations';
// 动画可以直接在组件中定义。我们在独立的文件中定义动画，导入到app.component.ts组件中, 同时也让我们可以复用这些动画。
// 在转场期间，新视图将直接插入在旧视图后面，并且这两个元素会同时出现在屏幕上。
// 要防止这种情况，就要为宿主视图以及要删除和插入的子视图指定一些额外的样式。
// 宿主视图必须使用相对定位模式，而子视图则必须使用绝对定位模式。
// query(":enter") 语句会返回已插入的视图，query(":leave") 语句会返回已移除的视图
// 使用 group() 函数来并行运行内部动画
export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 20,
        left: 20,
        width: '100%',
      }),
    ]),
    // query(':enter', [
    //   style({ left: '-100%' })
    // ]),
    group([
      query(':enter', [
        animate(
          '1000ms ease',
          keyframes([
            style({ transform: 'scale(0) translateX(100%)' }),
            style({ transform: 'scale(0.5) translateX(50%)' }),
            style({ transform: 'scale(1) translateX(0%)' }),
          ]),
        ),
      ]),
      query(':leave', [animate('500ms ease-in', style({ left: '-200%' }))]),
      // query(':leave', [
      //   animate('2000ms ease', keyframes([
      //     style({ transform: 'scale(1)', offset: 0 }),
      //     style({ transform: 'scale(0.5) translateX(-25%) rotate(0)', offset: 0.35 }),
      //     style({ opacity: 0, transform: 'translateX(-50%) rotate(-180deg) scale(6)', offset: 1 }),
      //   ])),
      // ])
    ]),
    // Required only if you have child animations on the page
    // query(':leave', animateChild()),
    // group([
    //   query(':leave', [
    //     animate('500ms ease-in', style({ left: '100%' }))
    //   ]),
    //   query(':enter', [
    //     animate('500ms 200ms ease-in', style({ left: '0%' }))
    //   ]),
    // ]),
    // Required only if you have child animations on the page
    // query(':enter', animateChild()),
  ]),
]);
