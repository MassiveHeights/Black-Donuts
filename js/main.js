import { Black, Engine, CanvasDriver, Input, MasterAudio, Orientation, StageScaleMode } from 'black-engine';
import Game from './game';

const engine = new Engine('container', Game, CanvasDriver, [Input, MasterAudio]);
engine.pauseOnBlur = false;
engine.pauseOnHide = false;

engine.start();

engine.stage.scaleMode = StageScaleMode.LETTERBOX;
engine.stage.setSize(640, 960);

engine.viewport.orientation = Orientation.PORTRAIT;

var seed = ~~(Math.random() * 1001);
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

Math.random = random;