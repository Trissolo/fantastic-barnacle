import { Scene } from 'phaser';
import CommonSceneNames from './CommonSceneNames';

export class Game extends Scene
{
    constructor ()
    {
        super(CommonSceneNames[0]);
    }

    create ()
    {
        console.log("Starting:", this.scene.key);
        
        this.cameras.main.setBackgroundColor(0x2378bd);

        this.add.bitmapText(8, 10, 'bitsy', 'Hello!').setOrigin(0);

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        });
    }
}
