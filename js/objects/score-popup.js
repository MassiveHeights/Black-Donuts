import { GameObject, MathEx, Tween, Ease, TextField, FontStyle, FontWeight, FontAlign, TextStyle } from 'black-engine';

export default class ScorePopup extends GameObject {
  constructor(score) {
    super();
    this.score = score;
  }

  onAdded() {
    let staticStyle = new TextStyle('Fredoka One', 0xe85656, 40, FontStyle.NORMAL, FontWeight.BOLD, 4, 0xfffdd4);
    let textField = new TextField();

    textField.setDefaultStyle(staticStyle);
    textField.autoSize = true;
    textField.align = FontAlign.CENTER;;
    textField.text = this.score.toString();

    textField.alignPivotOffset(0.5, 0.5);
    this.addChild(textField);

    textField.scale = 0;
    textField.add(
      new Tween({ scale: 1 }, 0.2, { ease: Ease.backOut }),
      new Tween({ y: -40 }, 0.5, { ease: Ease.sinusoidalOut }),
      new Tween({ alpha: 0 }, 0.3, { ease: Ease.sinusoidalIn, delay: 0.3 })
    );
  }
}