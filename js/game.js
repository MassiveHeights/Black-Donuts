import { GameObject, TextField, AssetManager, Black, TextStyle, Graphics, CapsStyle, JointStyle, Sprite, Time, Vector, Tween, Ease, Input, MasterAudio, MathEx, Message } from 'black-engine';

import Background from './objects/background';
import Board from './objects/board';
import CTA from './objects/cta';
import Hint from './objects/hint';
import TextTable from './objects/text-table';
import FXTrail from './objects/fx-trail';
import ScorePopup from './objects/score-popup';
import TextPopup from './objects/text-popup';
import LP from './lp';

import bg from 'assets/textures/background.jpg';
import assets_png from 'assets/atlas/assets.png';
import assets_json from 'assets/atlas/assets.json';

import bg_mp3 from 'assets/audio/background.mp3';
import itemKill from 'assets/audio/kill.mp3';
import select_1 from 'assets/audio/select-1.mp3';
import select_2 from 'assets/audio/select-2.mp3';
import select_3 from 'assets/audio/select-3.mp3';
import select_4 from 'assets/audio/select-4.mp3';
import select_5 from 'assets/audio/select-5.mp3';
import select_6 from 'assets/audio/select-6.mp3';
import select_7 from 'assets/audio/select-7.mp3';
import select_8 from 'assets/audio/select-8.mp3';
import select_9 from 'assets/audio/select-9.mp3';

export default class Game extends GameObject {
  constructor() {
    super();
    this.touchable = true;
    this.score = 0;
    this.targetScore = 500;
    this.tutorialVisible = false;
    this.ctaInited = false;

    this.hintOnIdleTime = 6;
    this.lastActionTime = 0;
    this.selectSounds = ['select-1', 'select-2', 'select-3', 'select-4', 'select-5', 'select-6', 'select-7', 'select-8', 'select-9',];

    this.textPopupPraises = ['Awesome', 'Good', 'Amazing', 'Impressive'];
    this.praiseOn = 5;
    this.load();
  }

  load() {
    let assets = new AssetManager();

    assets.enqueueImage('bg', bg);
    assets.enqueueAtlas('assets', assets_png, assets_json);
    assets.enqueueGoogleFont('Fredoka One');

    assets.enqueueSound('background', bg_mp3);
    assets.enqueueSound('itemKill', itemKill);

    assets.enqueueSound('select-1', select_1);
    assets.enqueueSound('select-2', select_2);
    assets.enqueueSound('select-3', select_3);
    assets.enqueueSound('select-4', select_4);
    assets.enqueueSound('select-5', select_5);
    assets.enqueueSound('select-6', select_6);
    assets.enqueueSound('select-7', select_7);
    assets.enqueueSound('select-8', select_8);
    assets.enqueueSound('select-9', select_9);

    assets.on('complete', this.onAssetsLoadded, this);

    assets.loadQueue();
  }

  onAssetsLoadded() {
    Black.audio.play('background', 'master', 1, true);

    this.addChild(new Background('bg'));

    this.board = this.addChild(new Board());
    this.board.x = this.stage.centerX;
    this.board.y = this.stage.centerY;

    this.board.on('pointerDown', x => this.hint.hide(), this);
    this.board.on('kill', this.onItemsKilled, this);
    this.board.on('selected', this.onItemSelected, this);
    this.board.on('allDeselected', this.onAllDeselected, this);

    this.fxTrail = this.addChild(new FXTrail());
    this.textTable = this.addChild(new TextTable());
    this.selection = this.addChild(new Graphics());
    this.textPopup = this.addChild(new TextPopup());
    this.textPopup.x = this.stage.centerX;
    this.textPopup.y = this.stage.centerY;

    this.textTable.setScore(`Score: ${this.score}/${this.targetScore}`);

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
    Black.audio.play('itemKill');

    this.selection.clear();
    this.addScore(this.getScore(items.length));

    for (let i = 0; i < items.length; i++) {
      let scorePopup = new ScorePopup(~~(this.getScore(items.length) / items.length));
      let item = items[i];

      let p = item.parent.localToGlobal(new Vector(item.x - 25, item.y - 25));
      p = this.parent.globalToLocal(p);

      scorePopup.x = p.x;
      scorePopup.y = p.y;
      this.addChild(scorePopup);
    }

    if (items.length >= this.praiseOn)
      this.textPopup.show(this.textPopupPraises[MathEx.randomBetween(0, this.textPopupPraises.length - 1)]);

    if (this.score >= this.targetScore)
      this.showCTA();
  }

  getScore(itemCount) {
    let ns = ((itemCount * 10) + ((itemCount * 10 - 30) * Math.sqrt(itemCount))) * 1;
    ns /= 2;
    return ~~ns;
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
    let soundName = this.selectSounds[Math.min(this.selectSounds.length - 1, items.length - 1)];
    Black.audio.play(soundName);
  }

  onAllDeselected() {
    this.selection.clear();
  }

  showCTA() {
    if (this.ctaInited) {
      return;
    }

    this.ctaInited = true;
    this.textPopup.show('WELL DONE');
    this.textPopup.on('complete', () => {
      let tween = this.textTable.addComponent(new Tween({ y: this.textTable.y - 200 }, 0.5, { delay: 0.5, ease: Ease.cubicOut }));
      tween.on('complete', () => this.textTable.visible = false);
      this.fxTrail.visible = false;

      setTimeout(() => this.board.hide(), 300);
      setTimeout(() => this.addChild(new CTA()), 700);
    });
  }

  onResize() {
    this.board.x = this.stage.centerX + 15;
    this.board.y = this.stage.centerY + 50;

    this.textPopup.x = this.stage.centerX;
    this.textPopup.y = this.stage.centerY;

    this.selection.x = this.board.x;
    this.selection.y = this.board.y;
    this.selection.pivotOffsetX = this.board.pivotX;
    this.selection.pivotOffsetY = this.board.pivotY;

    this.textTable.x = this.stage.centerX;
    this.textTable.y = -this.stage.y;
  }

  onUpdate() {
    if (Black.input.isPointerDown) {
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