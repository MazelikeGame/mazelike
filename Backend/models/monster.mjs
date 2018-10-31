import Sequelize from 'sequelize';

// You can call this with or without new it should work either way
export default function MonsterModel(sequelize) {
  let monster = sequelize.define('monsters', {
    floorId: Sequelize.STRING,
    x: Sequelize.INTEGER,
    y: Sequelize.INTEGER,
    hp: Sequelize.INTEGER,
    type: Sequelize.INTEGER
  });
  monster.sync();
  return monster;
}
 