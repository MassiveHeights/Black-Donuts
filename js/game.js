import {
  GameObject, TextField, AssetManager, Black, TextStyle, Graphics, CapsStyle, JointStyle, Sprite, Time, Vector, Tween, Ease, Input, BlendMode, FloatScatter,
  Emitter,
  InitialLife,
  ScaleOverLife,
  AlphaOverLife,
  Acceleration,
  MathEx
} from 'black';
import Background from './objects/background';
import Board from './objects/board';
import CTA from './objects/cta';
import Hint from './objects/hint';
import TextTable from './objects/text-table';
import FXTrail from './objects/fx-trail';

export default class Game extends GameObject {
  constructor() {
    super();
    this.touchable = true;
    this.score = 0;
    this.targetScore = 500;
    this.tutorialVisible = false;

    this.hintOnIdleTime = 6;
    this.lastActionTime = 0;

    this.load();
  }

  load() {
    let assets = AssetManager.default;

    assets.defaultPath = './assets/';
    assets.enqueueImage('bg', 'background.jpg');
    assets.enqueueAtlas('bg', 'assets.png', 'assets.json');
    assets.enqueueGoogleFont('Fredoka One');

    assets.on('complete', this.onAssetsLoadded, this);
    assets.loadQueue();
  }

  onAssetsLoadded() {
    this.addChild(new Background('bg'));

    this.board = this.addChild(new Board(this.stage.LP(7, 6), this.stage.LP(5, 8)));
    this.board.x = this.stage.centerX + 15;
    this.board.y = this.stage.centerY + 50;
    this.board.on('pointerDown', x => this.hint.hide(), this);
    this.board.on('kill', this.onItemsKilled, this);
    this.board.on('selected', this.onItemSelected, this);
    this.board.on('allDeselected', this.onAllDeselected, this);
    this.fxTrail = this.addChild(new FXTrail());

    this.textTable = this.addChild(new TextTable());

    this.selection = new Graphics();
    this.addChild(this.selection);

    this.hint = this.addChild(new Hint());
    this.stage.on('resize', this.onResize, this);

    this.onResize();

    let initialY = 5;
    this.textTable.y = - 200;

    let tween = new Tween({ y: initialY }, 0.5, { delay: 0.5, ease: Ease.cubicOut });
    tween.on('start', this.showHint, this);
    this.textTable.add(tween);
  }

  onItemsKilled(msg, items) {
    this.hint.hide();

    this.selection.clear();

    var ns = ((items.length * 10) + ((items.length * 10 - 30) * Math.sqrt(items.length))) * 1;
    ns /= 2;
    ns = ~~ns;
    this.addScore(ns);

    if (this.score >= this.targetScore)
      this.showCTA();
  }

  addScore(count) {
    this.score += ~~count;

    if (this.score > this.targetScore)
      this.score = this.targetScore;

    this.textTable.setScore(`Score: ${this.score}/${this.targetScore}`);
  }

  onItemSelected(msg, item, items) {
    let sx = items[0].x;
    let sy = items[0].y;

    this.selection.clear();
    this.selection.beginPath();
    this.selection.lineStyle(40, 0xffffff, 0.7, CapsStyle.ROUND, JointStyle.ROUND);
    this.selection.moveTo(sx - 25, sy - 25);

    for (let i = 1; i < items.length; i++) {
      let it = items[i];

      this.selection.lineTo(it.x - 25, it.y - 25);
    }

    this.selection.stroke();
  }

  onAllDeselected() {
    this.selection.clear();
  }

  showCTA() {
    let tween = this.textTable.addComponent(new Tween({ y: this.textTable.y - 200 }, 0.5, { delay: 0.5, ease: Ease.cubicOut }));
    tween.on('complete', () => this.textTable.visible = false);
    this.fxTrail.visible = false;

    setTimeout(() => this.board.hide(), 300);
    setTimeout(() => this.addChild(new CTA()), 700);
  }

  onResize() {
    this.board.x = this.stage.centerX + 15;
    this.board.y = this.stage.centerY + 50;

    this.selection.x = this.board.x;
    this.selection.y = this.board.y;
    this.selection.pivotOffsetX = this.board.pivotX;
    this.selection.pivotOffsetY = this.board.pivotY;

    this.textTable.x = this.stage.centerX;
    this.textTable.y = -this.stage.y;
  }

  onUpdate() {
    if (Input.isPointerDown) {
      this.lastActionTime = Time.now;
      return;
    }

    if (this.hint && Time.now - this.lastActionTime > this.hintOnIdleTime && this.hint.inProgress === false && this.board.isEnabled) {
      this.showHint();
    }
  }

  showHint() {
    const matchingClusters = this.board.getMatchingClusters();

    if (matchingClusters.length > 0) {
      const bigestMatchingClusters = matchingClusters.sort((a, b) => b.length - a.length)[0];
      this.hint.show(bigestMatchingClusters);
    }
  }
}