import { GameObject, Input, MathEx, Tween, Ease, Vector } from 'black-engine';
import Item from './item';
import FitViewportComponent from '../fit-component';

export default class Board extends GameObject {
  constructor(w, h) {
    super();
    this.touchable = true;

    this.gridWidth = w;
    this.gridHeight = h;
    this.minMatchingCount = 3;
    this.isEnabled = true;

    this.firstSelected = null;
    this.lastSelected = null;
    this.selectedItems = [];
    this.removedItems = [];
    this.grid = [];
    this.items = [];

    Input.on(Input.POINTER_UP, this.onPointerUp, this);
  }

  onAdded() {
    this.prepare();
    this.alignPivotOffset();
  }

  prepare() {
    for (let h = 0; h < this.gridHeight; h++) {
      this.grid.push([]);
      for (let w = 0; w < this.gridWidth; w++) {
        this.grid[h][w] = this.createItem(w, h, -1);
      }
    }
  }

  createItem(x, y, type) {
    let item = new Item(x, y, type);
    this.addChild(item);
    this.items.push(item);
    return item;
  }

  trySelect() {
    for (const item of this.items) {
      let contains = item.hitTest(Input.pointerPosition);

      if (item.selected || !contains)
        continue;

      if (this.firstSelected === null)
        this.firstSelected = item;

      if (item.type !== this.firstSelected.type)
        continue;

      if (this.lastSelected !== null && !item.inRange(this.lastSelected))
        continue;

      this.select(item);
    }
  }

  hide() {
    this.isEnabled = false;

    const centerY = this.gridHeight / 2;
    const centerX = this.gridWidth / 2;
    const maxDistance = MathEx.distance(0, 0, centerX, centerY);

    const animate = item => {
      let distance = MathEx.distance(item.cx, item.cy, centerX, centerY);
      let delay = MathEx.lerp(0.5, 0, distance / maxDistance);

      item.playHide(delay, Ease.backIn);
    };

    this.items.forEach(animate);
  }

  select(item) {
    this.lastSelected = item;

    item.select();
    this.selectedItems.push(item);

    this.post('selected', item, this.selectedItems);
  }

  deselect(item) {
    this.lastSelected = this.selectedItems[this.selectedItems.length - 1];

    item.deselect();
    let index = this.selectedItems.indexOf(item);
    this.selectedItems.splice(index, 1);

    this.post('deSelected', item, this.selectedItems);
  }

  deselectAll() {
    for (const item of this.items) {
      item.deselect();
    }

    this.firstSelected = null;
    this.lastSelected = null;
    this.selectedItems = [];
    this.removedItems = [];

    this.post('allDeselected');
  }

  removeSelected() {
    for (const item of this.items) {
      if (!item.selected)
        continue;

      this.removedItems.push(item);
      item.metamorphose();
    }

    this.post('kill', this.removedItems);
  }

  moveDown() {
  }

  getMatchingClusters() {
    let clusters = [];

    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        let item = this.grid[i][j];
        let matchingItems = this.getMatchingItems(item, item.type);

        if (matchingItems.length >= this.minMatchingCount - 1) {
          matchingItems.unshift(item);
          clusters.push(matchingItems);
        }
      }
    }

    return clusters;
  }

  getMatchingItems(item) {
    this.items.forEach(item => item.traversed = false);
    return this.findMatchingClusters(item, item.type);
  }

  findMatchingClusters(item, targetType, result = []) {
    let neighbors = this.getItemNeighbors(item);
    let bestNode = null;
    let bestWeight = 0;
    item.traversed = true;

    for (let i = 0; i < neighbors.length; i++) {
      let n = neighbors[i];
      let weight = (n.cx !== item.cx && n.cy !== item.cy) ? 1 : 2;

      if (n.traversed === false && n.type === targetType && weight > bestWeight) {
        bestNode = n;
        bestWeight = weight;
      }
    }

    if (bestNode) {
      result.push(bestNode);
      this.findMatchingClusters(bestNode, targetType, result);
    }

    return result;
  }

  getItemNeighbors(item) {
    const map = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },

      //diagonal
      { x: -1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
    ];

    let neighbors = [];
    for (let i = 0; i < map.length; i++) {
      let x = item.cx + map[i].x;
      let y = item.cy + map[i].y;

      if (x < 0 || y < 0 || y >= this.grid.length || x >= this.grid[0].length)
        continue;

      neighbors.push(this.grid[y][x]);
    }
    return neighbors;
  }

  onPointerUp(msg) {
    if (this.isEnabled === false)
      return;

    if (this.selectedItems.length > 2) {
      this.removeSelected();
      this.moveDown();
    } else {
      this.deselectAll();
    }

    this.removedItems = [];
    this.firstSelected = null;
    this.lastSelected = null;
    this.selectedItems = [];
  }

  onUpdate(dt) {
    if (Input.isPointerDown && this.isEnabled) {
      this.clicked = true;
      this.trySelect();
    }
  }
}

Board.GRID_SIZE = 95;