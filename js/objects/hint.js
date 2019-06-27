import { Ease, MathEx, Sprite, Tween, Vector } from 'black-engine';

export default class Hint extends Sprite {
  constructor() {
    super('hand');
    
    this.speed = 0.005;
    this.visible = false;
    this.inProgress = false;
    this.wasShown = false;
    this.alignPivotOffset(0.4, 0.2);
  }

  show(items) {
    if (items.length === 0 || this.inProgress === true)
      return;

    this.visible = true;
    this.wasShown = true;
    this.inProgress = true;
    this.scale = 0;

    let path = this.getHandPath(items);
    this.x = path.x.shift();
    this.y = path.y.shift();

    let tweenShow = new Tween({ scale: 1 }, 0.2, { ease: Ease.backOut, removeOnComplete: true });
    let tweenMove = new Tween({ x: path.x, y: path.y }, this.getDurationByPath(path), { ease: Ease.smootherStep, delay: 0.2, removeOnComplete: true });
    this.add(tweenShow, tweenMove);
    tweenMove.on('complete', this.hide, this);
  }

  hide() {
    if (this.inProgress === false)
      return;

    this.inProgress = false;
    let tween = this.add(new Tween({ scale: 0 }, 0.2, { ease: Ease.backIn, removeOnComplete: true }));
  }

  getDurationByPath(path) {
    let distance = 0;
    for (let i = 1; i < path.x.length; i++) {
      distance += MathEx.distance(path.x[i], path.y[i], path.x[i - 1], path.y[i - 1]);
    }

    return distance * this.speed;
  }

  getHandPath(items) {
    let result = {
      x: [],
      y: []
    };

    items.forEach(item => {
      let p = item.parent.localToGlobal(new Vector(item.x, item.y));
      p = this.parent.globalToLocal(p);

      result.x.push(p.x);
      result.y.push(p.y);
    });

    return result;
  }
}