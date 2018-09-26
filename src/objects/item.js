import { DisplayObject, MathEx, Sprite, CircleCollider, Tween, Ease, TextField, AssetManager, ObjectPool } from 'black';
import Board from './board';
import FXBoom from './fx-boom';

export default class Item extends DisplayObject {
  constructor(cx, cy, type = -1) {
    super();

    if (type === -1)
      type = MathEx.randomBetween(1, 5);

    this.touchable = true;

    this.traversed = false;
    this.cx = cx;
    this.cy = cy;
    this.type = type;
    this.selected = false;

    this.selectionTween = null;
    this.hideTween = null;
    this.showTween = null;

    this.shadow = this.addChild(new Sprite('shadow'));
    this.shadow.x = 10 - Board.GRID_SIZE;
    this.shadow.y = 10 - Board.GRID_SIZE;
    this.shadow.alpha = 1;
    this.shadow.alignPivotOffset();

    this.fg = this.addChild(new Sprite(`player-${type}`));
    this.fg.alignPivotOffset();
    this.fg.x = -Board.GRID_SIZE;
    this.fg.y = -Board.GRID_SIZE;

    this.x = this.cx * Board.GRID_SIZE;
    this.y = this.cy * Board.GRID_SIZE;

    this.alignPivotOffset();

    this.fg.touchable = true;
    this.fg.on('pointerDown', this.onPointerDown, this);
  }

  onPointerDown(msg) {
    this.scale -= 0.1;
    this.post('clicked');
  }

  metamorphose(newType = -1) {
    this.type = (newType === -1) ? MathEx.randomBetween(1, 5) : newType;

    let fx = this.parent.addChild(new FXBoom());
    fx.x = this.x - 25;
    fx.y = this.y - 25;

    this.deselect();
    this.playHide().on('complete', () => {
      this.fg.texture = AssetManager.default.getTexture(`player-${this.type}`);
      this.playShow();
    });
  }

  playHide(delay = 0, ease = Ease.smootherStep) {
    this.removeTweens();
    this.showTween = this.addComponent(new Tween({ scale: 0 }, 0.15,  { delay, ease }));
    return this.showTween;
  }

  playShow(delay = 0, ease = Ease.backOut) {
    this.removeTweens();
    this.hideTween = this.addComponent(new Tween({ scale: 1 }, 0.2, { delay, ease }));
    return this.hideTween;
  }

  removeTweens() {
    if (this.hideTween) {
      this.removeComponent(this.hideTween);
      this.hideTween = null;
    }

    if (this.showTween) {
      this.removeComponent(this.showTween);
      this.showTween = null;
    }
  }

  select() {
    this.selected = true;
    this.scale = 1.1;
    this.__animateSelect();
  }

  deselect() {
    this.selected = false;
    this.scale = 1;

    if (this.selectionTween) {
      this.fg.removeComponent(this.selectionTween);
      this.fg.rotation = 0;

      this.selectionTween = null;
    }
  }

  moveDown() {

  }

  inRange(item) {
    return MathEx.distance(this.x - 50, this.y - 50, item.x - 50, item.y - 50) <= 150;
  }

  __animateSelect() {
    let tw = new Tween({ rotation: 1.25 }, 0.2, { yoyo: true, repeats: Infinity, ease: Ease.smootherStep });
    this.selectionTween = this.fg.addComponent(tw);
  }
}