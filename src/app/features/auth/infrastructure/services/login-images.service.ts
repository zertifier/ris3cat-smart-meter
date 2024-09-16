import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginImagesService {
  backgroundImages = [
    'assets/img/login/bg1.jpg',
    'assets/img/login/bg2.jpg',
    'assets/img/login/bg3.jpg',
    'assets/img/login/bg4.jpg',
    'assets/img/login/bg5.jpg',
    'assets/img/login/bg6.jpg',
  ]
  constructor() { }

  public getRandomImage(): string {
    const index = this.randomNumber(0, this.backgroundImages.length - 1);
    return this.backgroundImages[index];
  }

  /**
   * Return random number between min and max both included in range
   * @param min
   * @param max
   */
  randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
