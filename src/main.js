import Phaser from 'phaser'

import SnakeScene from './SnakeScene'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 800,
	scene: [SnakeScene],
	backgroundColor: 0xffffff
}

export default new Phaser.Game(config)
