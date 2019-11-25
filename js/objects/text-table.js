import { GameObject, Sprite, Tween, Ease, MathEx, TextStyle, FontStyle, FontWeight, FontAlign, TextField } from 'black-engine';

export default class TextTable extends Sprite {
  constructor() {
    super('table');

    /** @type {TextStyle|null} */
    this.textStyle = null;

    /** @type {TextField|null} */
    this.textField = null;
  }

  onAdded() {
    this.textStyle = new TextStyle('Fredoka One', 0xe85656, 34, FontStyle.NORMAL, FontWeight.BOLD, 4, 0xfffdd4);

    let staticStyle = this.textStyle;
    staticStyle.dropShadow = true;
    staticStyle.shadowColor = 0x000000;
    staticStyle.shadowDistanceX = 4;
    staticStyle.shadowDistanceY = 4;
    staticStyle.shadowBlur = 1;

    this.textField = new TextField();
    this.textField.setStyle('static', staticStyle);
    this.textField.autoSize = true;
    this.textField.align = FontAlign.CENTER;
    this.textField.x = this.width / 2;
    this.textField.y = this.height / 2 + 15;
    this.textField.multiline = true;
    this.textField.lineHeight = 2.5;

    this.textField.alignPivotOffset(0.5, 0.5);
    this.addChild(this.textField);

    this.setText('Match 3 or more!', false);
    this.alignPivotOffset(0.5, 0.5);
  }

  setText(value, tween = true) {
    this.textField.text = '~{static}' + value;
    this.textField.alignPivotOffset(0.5, 0.5);

    if (tween) {
      this.add(new Tween({ scaleY: [1.02, 1], scaleX: [1.05, 1] }, 0.3, { ease: Ease.backOut }));
    }
  }

  setScore(v) {
    this.setText(v);

    this.textStyle.size = 41;

    this.textField.y = this.height / 2 + 20;
    this.textField.alignPivotOffset(0.5, 0.5);
  }
}