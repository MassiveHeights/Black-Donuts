import {
  GameObject,
  FloatScatter,
  Emitter,
  AssetManager,
  InitialLife,
  ScaleOverLife,
  BlendMode,
  Acceleration,
  InitialVelocity
} from 'black';

export default class FXBoom extends GameObject {
  constructor(type) {
    super();
    this.type = type;
  }

  onAdded() {
    this.emitter = this.addChild(new Emitter());

    this.emitter.emitCount = new FloatScatter(2);
    this.emitter.emitDelay = new FloatScatter(0);
    this.emitter.emitInterval = new FloatScatter(0);
    this.emitter.emitDuration = new FloatScatter(0.1);
    this.emitter.emitNumRepeats = new FloatScatter(0);

    this.emitter.textures = AssetManager.default.getTextures('particle_ex*');

    this.emitter.space = this;
    this.emitter.blendMode = BlendMode.ADD;
    this.emitter.add(new InitialLife(0.3));
    this.emitter.add(new InitialVelocity(-300, -300, 300, 300));
    this.emitter.add(new Acceleration(0, 1000, 0, 1000));
    this.emitter.add(new ScaleOverLife(1, 0));

    this.addChild(this.emitter);
  }
}