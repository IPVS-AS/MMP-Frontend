import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-http-loading-animation',
  templateUrl: './http-loading-animation.component.html',
  styleUrls: ['./http-loading-animation.component.scss']
})
export class HttpLoadingAnimationComponent implements OnInit {
  public lottieConfig: Object;

  constructor() {
    this.lottieConfig = {
      path: 'assets/animation/thinking_lamp.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };
  }

  ngOnInit() {
  }

}
