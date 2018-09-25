import { Black, GameObject, Emitter } from "black";

export class PerfMonitor {
  constructor() {
    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.refreshRate = 250; // ms
    this.mCounters = [];

    this.mContainer = document.createElement('div');
    this.mContainer.style.cssText = `position:fixed; top:8px; left:8px; cursor:pointer; opacity:0.95; z-index:999; max-width: ${PerfMonitor.BASE_WIDTH}px`;
    this.mContainer.className = 'perf-monitor';

    document.body.appendChild(this.mContainer);

    for (let i = 0; i < this.mCounters.length; i++) {
      const counter = this.mCounters[i];
      counter.prevTime = this.beginTime;
    }

    requestAnimationFrame(x => {
      this.update();
    });
  }

  update() {
    this.beginTime = this.__end();

    requestAnimationFrame(x => {
      this.update();
    });
  }

  __begin() {
    this.beginTime = (performance || Date).now();
  }

  __end() {
    let time = (performance || Date).now();

    for (let i = 0; i < this.mCounters.length; i++) {
      const counter = this.mCounters[i];
      counter.frames++;

      if (time >= counter.prevTime + this.refreshRate) {
        counter.update(time, this.beginTime);

        counter.prevTime = time;
        counter.frames = 0;
      }
    }

    return time;
  }

  add(counter) {
    this.mContainer.appendChild(counter.__dom);
    this.mCounters.push(counter);
  }
}

PerfMonitor.BASE_WIDTH = 128;
PerfMonitor.BASE_HEIGHT = 48;

class PerfCounter {
  constructor(name) {
    this.name = name;
    this.min = Infinity;
    this.max = 0;
    this.prevTime = 0;
    this.frames = 0;
    this.mValue = 0;
    this.maxValue = 60;

    this.mCanvas = document.createElement('canvas');
    this.mCanvas.width = PerfCounter.WIDTH;
    this.mCanvas.height = PerfCounter.HEIGHT;
    this.mCanvas.className = 'perf-counter';
    this.mCanvas.style.cssText = `width:${PerfMonitor.BASE_WIDTH}px;height:${PerfMonitor.BASE_HEIGHT}px; box-shadow: 0px 4px 10px -3px rgba(0,0,0,0.75);`;

    this.mCtx = this.mCanvas.getContext('2d');
    this.mCtx.font = 'bold ' + (9 * PerfCounter.DPR) + 'px Helvetica,Arial,sans-serif';
    this.mCtx.textBaseline = 'top';

    this.mCtx.fillStyle = PerfCounter.BG;
    this.mCtx.globalAlpha = 1;
    this.mCtx.fillRect(PerfCounter.GRAPH_X, PerfCounter.GRAPH_Y, PerfCounter.GRAPH_WIDTH, PerfCounter.GRAPH_HEIGHT);
  }

  set value(v) {
    if (v > this.maxValue)
      this.mValue = this.maxValue;
    else
      this.mValue = v;

    this.min = Math.min(this.min, this.mValue);
    this.max = Math.max(this.max, this.mValue);
  }

  get value() {
    return this.mValue;
  }

  update(time, begin, frames) {
    this.value = (this.frames * 1000) / (time - this.prevTime);

    this.draw();
  }

  draw() {
    let value = this.value;
    let maxValue = this.maxValue;

    this.mCtx.fillStyle = PerfCounter.BG;
    this.mCtx.globalAlpha = 1;
    this.mCtx.fillRect(0, 0, PerfCounter.WIDTH, PerfCounter.GRAPH_Y);
    this.mCtx.fillStyle = PerfCounter.FG;
    this.mCtx.fillText(Math.round(value) + ' ' + this.name + ' (' + Math.round(this.min) + '-' + Math.round(this.max) + ')', PerfCounter.TEXT_X, PerfCounter.TEXT_Y);

    this.mCtx.drawImage(this.mCanvas, PerfCounter.GRAPH_X + PerfCounter.DPR, PerfCounter.GRAPH_Y, PerfCounter.GRAPH_WIDTH - PerfCounter.DPR, PerfCounter.GRAPH_HEIGHT, PerfCounter.GRAPH_X, PerfCounter.GRAPH_Y, PerfCounter.GRAPH_WIDTH - PerfCounter.DPR, PerfCounter.GRAPH_HEIGHT);
    this.mCtx.fillRect(PerfCounter.GRAPH_X + PerfCounter.GRAPH_WIDTH - PerfCounter.DPR, PerfCounter.GRAPH_Y, PerfCounter.DPR, PerfCounter.GRAPH_HEIGHT);
    this.mCtx.fillStyle = PerfCounter.BG;
    this.mCtx.globalAlpha = 1;
    this.mCtx.fillRect(PerfCounter.GRAPH_X + PerfCounter.GRAPH_WIDTH - PerfCounter.DPR, PerfCounter.GRAPH_Y, PerfCounter.DPR, Math.round((1 - (value / maxValue)) * PerfCounter.GRAPH_HEIGHT));
  }

  get __dom() {
    return this.mCanvas;
  }
}

PerfCounter.DPR = Math.round(window.devicePixelRatio || 1);
PerfCounter.WIDTH = PerfMonitor.BASE_WIDTH * PerfCounter.DPR;
PerfCounter.HEIGHT = PerfMonitor.BASE_HEIGHT * PerfCounter.DPR;
PerfCounter.BG = 'black';
PerfCounter.FG = '#f9b623';
PerfCounter.GRAPH_X = 0;
PerfCounter.GRAPH_Y = 15 * PerfCounter.DPR;
PerfCounter.GRAPH_WIDTH = PerfMonitor.BASE_WIDTH * PerfCounter.DPR;
PerfCounter.GRAPH_HEIGHT = 33 * PerfCounter.DPR;
PerfCounter.TEXT_X = 3 * PerfCounter.DPR;
PerfCounter.TEXT_Y = 2 * PerfCounter.DPR;

export class FPSCounter extends PerfCounter {
  constructor() {
    super('FPS');
  }

  update(time, begin, frames) {
    this.value = (this.frames * 1000) / (time - this.prevTime);

    this.draw();
  }
}

export class DeltaCounter extends PerfCounter {
  constructor() {
    super('ms');

    this.maxValue = (1 / 15) * 1000;
  }
  update(time, begin, frames) {
    this.value = time - begin;
    this.draw();
  }
}


export class BlackObjectsCounter extends PerfCounter {
  constructor() {
    super('Objects');

    this.maxValue = 10000;
  }

  update(time, begin, frames) {
    if (Black.instance == null)
      return;

    let counter = 0;
    GameObject.forEach(null, x => {
      counter++;
    });

    this.value = counter;

    this.draw();
  }
}

export class BlackParticleCounter extends PerfCounter {
  constructor() {
    super('Particles');

    this.maxValue = 1000;
  }

  update(time, begin, frames) {
    if (Black.instance == null)
      return;

    let counter = 0;
    GameObject.forEach(null, x => {
      if (x instanceof Emitter && x.visible === true)
        counter += x.mParticles.length;
    });

    this.value = counter;

    this.draw();
  }
}

