import m from 'mithril';
import { OnionList } from '../../../src/Utils';

class Route extends OnionList {
  get cost(){
    return  this.tail
      ? this.head.cost + this.tail.cost
      : this.head.cost;
  }
}

class Field {
  constructor(x, y, state){
    this.x = x;
    this.y = y;
    this.state = state;
    Object.freeze(this);
  }
  isAccessible(){
    return this.state.building === 'wall'  ? false : true;
  }
  get cost(){
    return this.state.building === 'road' ? 1 : 3;
  }
}

const generate = (length, f) => Object.freeze(
  [ ...Array(length).keys() ].map(f)
);

class GameMap {
  constructor(height, width){
    const map = generate(
      width,
      (x) => generate(
        height,
        (y) => new Field(x, y, { })
      )
    );
    this.get = (x, y) => map[x][y];
    Object.freeze(this);
  }
}

const renderField = (field) => {
  const { building } = field.state;
  let color = building === 'wall'
    ? '#333'
      : building === 'road'
        ? '#ccc'
        : 'white';

  return m('span', {
    style: {
      color
    }
  }, '');
}


var gamemap = new GameMap(30, 20);

export const Game = {
  view(){
    return m('table.game-table', [
      m('tbody', gamemap.map( row =>
        m('tr.game-tr', row.map( field =>
          m('tr.game-td', [ renderField(field) ])
        ))
      ))
    ]);
  }
}
