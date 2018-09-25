import { Sprite } from 'black';

export default class Background extends Sprite {
  constructor(texture) {
    super(texture);
  }

  onAdded() {
    this.refresh();

    this.stage.on('resize', this.refresh, this);
  }

  refresh() {
    let wD = this.width / this.scaleX;
    let hD = this.height / this.scaleY;

    let wR = this.stage.width + this.stage.x * 2;
    let hR = this.stage.height + this.stage.y * 2;

    let sX = wR / wD;
    let sY = hR / hD;

    let rD = wD / hD;
    let rR = wR / hR;

    let s = rD >= rR ? sY : sX;

    this.x = -this.stage.x;
    this.y = -this.stage.y;
    this.scaleX = this.scaleY = s;
  }
}