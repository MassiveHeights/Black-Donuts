import { Engine, CanvasDriver, Input, MasterAudio, Orientation, StageScaleMode } from 'black-engine';
import Game from './game';

const engine = new Engine('container', Game, CanvasDriver, [Input, MasterAudio]);
engine.enableFixedTimeStep = false;
engine.pauseOnBlur = false;
engine.pauseOnHide = false;

engine.start();

engine.stage.scaleMode = StageScaleMode.LETTERBOX;

//                         scale up the whole stage
engine.stage.setSize(960 / 1.5, 640 / 1.5);
engine.viewport.orientation = Orientation.UNIVERSAL;

var seed = ~~(Math.random() * 1001);

function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

Math.random = random;