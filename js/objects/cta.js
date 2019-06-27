import { Device, Ease, GameObject, Sprite, Tween, Black } from 'black-engine';
import FitViewportComponent from '../fit-component';
import LP from '../lp';

export default class CTA extends GameObject {
  constructor() {
    super();
    this.touchable = true;

    document.addEventListener(Device.isMobile ? 'touchstart' : 'mousedown', function (e) {
      window.location.href = 'http://blacksmith2d.io';
    });
  }

  onAdded() {
    this.stage.on('resize', this.onResize, this);

    let bg = this.addChild(new Sprite('black'));
    bg.alpha = 0;
    bg.add(new FitViewportComponent());

    let centerContainer = this.centerContainer = this.addChild(new GameObject());
    centerContainer.x = this.stage.centerX;
    centerContainer.y = this.stage.centerY;
    centerContainer.scale = LP(0.7, 1);
    centerContainer.touchable = true;

    let donut = new Sprite('donut');
    donut.alignPivotOffset();
    donut.y = -100;

    let logo = new Sprite('logo');
    logo.alignPivotOffset();
    logo.y = 100;

    let shadow = new Sprite('big-shadow');
    shadow.alignPivotOffset();
    shadow.x = donut.x + 30;
    shadow.y = donut.y + 20;

    let btnPlay = new Sprite('btn-play');
    btnPlay.alignPivotOffset();
    btnPlay.touchable = true;
    btnPlay.on('pointerDown', () => btnPlay.scale = 0.95);

    document.addEventListener(Black.device.isMobile ? 'touchstart' : 'mousedown', function (e) {
      btnPlay.scale = 1;
      window.location.href = 'http://blacksmith2d.io';
      return false;
    });

    let targetBtnY = donut.y + donut.height / 2 + btnPlay.height / 2 + 50;
    btnPlay.y = targetBtnY + 200;

    centerContainer.add(btnPlay, shadow, donut, logo);

    const animate = () => {
      logo.scale = 0;
      donut.scale = 3;
      shadow.alpha = 0;
      btnPlay.scale = 0;

      btnPlay.add(
        new Tween({ y: targetBtnY }, 0.3, { delay: 0.3, ease: Ease.backOut }),
        new Tween({ scale: 1 }, 0.4, { delay: 0.25, ease: Ease.backOut })
      );

      bg.add(new Tween({ alpha: 0.4 }, 0.3));
      logo.add(new Tween({ scale: 1 }, 0.3, { ease: Ease.backOut, delay: 0.2 }));
      donut.add(new Tween({ scale: 1 }, 0.3, { ease: Ease.backOut }));
      shadow.add(new Tween({ alpha: 1 }, 0.3));
    };

    animate();
  }

  onResize() {
    this.centerContainer.x = this.stage.centerX;
    this.centerContainer.y = this.stage.centerY;
    this.centerContainer.scale = LP(0.7, 1);
  }
}