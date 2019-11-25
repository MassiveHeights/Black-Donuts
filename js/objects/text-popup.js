import { GameObject, Sprite, Tween, Ease, MathEx, TextStyle, FontStyle, FontWeight, FontAlign, TextField } from 'black-engine';

export default class TextPopup extends GameObject {
  constructor() {
    super();

    /**
     * @type {TextField}
     */
    this.textField = null;

    /**
     * @type {boolean}
     */
    this.inProgress = false;

    /**
     * @type {Array<string>}
     */
    this.queue = [];
  }

  onAdded() {
    let staticStyle = new TextStyle('Fredoka One', 0xe85656, 100, FontStyle.NORMAL, FontWeight.BOLD, 16, 0xfffdd4);
    staticStyle.dropShadow = true;
    staticStyle.shadowColor = 0x000000;
    staticStyle.shadowDistanceX = 12;
    staticStyle.shadowDistanceY = 12;
    staticStyle.shadowBlur = 8;
    staticStyle.shadowAlpha = 0.5;

    this.textField = new TextField();
    this.textField.setDefaultStyle(staticStyle);
    this.textField.autoSize = true;
    this.textField.align = FontAlign.CENTER;
    this.textField.x = this.width / 2;
    this.textField.y = this.height / 2 + 22;
    this.textField.multiline = true;
    this.textField.lineHeight = 2.5;

    this.textField.alignPivotOffset(0.5, 0.5);
    this.textField.visible = false;
    this.addChild(this.textField);
  }

  setText(value, tween = true) {
    this.textField.text = value;
    this.textField.alignPivotOffset(0.5, 0.5);
  }

  show(string) {
    if (this.inProgress) {
      this.queue.push(string);
      return;
    }

    this.inProgress = true;
    this.setText(string);
    this.textField.visible = true;
    this.scale = 3;

    let r = Math.random() > 0.5 ? 1 : -1;

    let t1 = this.addComponent(new Tween({ scale: 1 }, 0.2, { ease: Ease.backOut }));
    let t2 = this.addComponent(new Tween({ rotation: [0.1 * r, 0] }, 0.2, { ease: Ease.sinusoidalInOut, delay: 0.2 }));
    let t3 = this.addComponent(new Tween({ scale: 0 }, 0.15, { ease: Ease.backIn, delay: 0.65 }));

    t3.on('complete', this._onComplete, this);
  }

  _onComplete() {
    this.textField.visible = false;
    this.inProgress = false;

    let next = this.queue.pop();
    if (next)
      this.show(next);
    else
      this.post('complete');
  }
}