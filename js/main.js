import { Black, CanvasDriver, Input, MasterAudio, Orientation, StageScaleMode } from 'black-engine';
import Game from './game';

const black = new Black('container', Game, CanvasDriver, [Input, MasterAudio]);
black.enableFixedTimeStep = false;
black.pauseOnBlur = false;
black.pauseOnHide = false;

black.start();

black.stage.scaleMode = StageScaleMode.LETTERBOX;
black.stage.setSize(960, 640);
black.viewport.orientation = Orientation.UNIVERSAL;

// let perf = new PerfMonitor(1);
// perf.add(new FPSCounter());
// perf.add(new BlackObjectsCounter());
// perf.add(new BlackParticleCounter());

var seed = ~~(Math.random() * 1001);
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

Math.random = random;