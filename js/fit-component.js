import { Black, Component, DisplayObject, Rectangle, Vector } from 'black-engine';

export default class FitViewportComponent extends Component {
  constructor(align = 'middleCenter', bounds = null, fillRect = true) {
    super();

    this.mAlign = align;
    this.bounds = bounds;
    this.mFillRect = fillRect;
    this.mIsActive = true;

    this.mResizeListener = null;
  }

  updateLayout() {
    if (!this.gameObject)
      return;

    let stage = this.gameObject.stage;

    if (!this.bounds)
      this.fitIntoRect(this.gameObject, stage.bounds, this.mFillRect, this.mAlign);
    else
      this.fitIntoRect(this.gameObject, this.bounds, this.mFillRect, this.mAlign);
  }

  __onViewResize(m) {
    this.post('update');
    this.updateLayout();
  }

  onAdded(gameObject) {
    this.mResizeListener = Black.stage.on('resize', this.__onViewResize, this);

    this.post('update');
    this.updateLayout();

    gameObject.onRemoved = () => {
      this.mResizeListener.off();
    };
  }

  onRemoved(gameObject) {
    this.mResizeListener.off();
  }

  fitIntoRect(displayObject, bounds, fillRect, align) {

    if (!this.mIsActive)
      return;

    let wD = displayObject.width / displayObject.scaleX;
    let hD = displayObject.height / displayObject.scaleY;

    let wR = bounds.width;
    let hR = bounds.height;

    let sX = wR / wD;
    let sY = hR / hD;

    let rD = wD / hD;
    let rR = wR / hR;

    let sH = fillRect ? sY : sX;
    let sV = fillRect ? sX : sY;

    let s = rD >= rR ? sH : sV;
    let w = wD * s;
    let h = hD * s;

    let tX = 0.0;
    let tY = 0.0;

    switch (align) {
      case 'left':
      case 'topLeft':
      case 'bottomLeft':
        tX = 0.0;
        break;

      case 'right':
      case 'topRight':
      case 'bottomRight':
        tX = w - wR;
        break;

      default:
        tX = 0.5 * (w - wR);
    }

    switch (align) {
      case 'top':
      case 'topLeft':
      case 'topRight':
        tY = 0.0;
        break;

      case 'bottom':
      case 'bottomLeft':
      case 'bottomRight':
        tY = h - hR;
        break;

      default:
        tY = 0.5 * (h - hR);
    }

    displayObject.x = bounds.x - tX;
    displayObject.y = bounds.y - tY;

    displayObject.scaleX = displayObject.scaleY = s;
  }

  get fillRect() {
    return this.mFillRect;
  }

  set fillRect(value) {
    this.mFillRect = value;
    this.updateLayout();
  }

  get isActive() {
    return this.mIsActive;
  }

  set isActive(value) {
    this.mIsActive = value;
    this.updateLayout();
  }
}