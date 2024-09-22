import { Scene } from 'phaser';

import CommonSceneNames from './CommonSceneNames';

export class GameOver extends Scene
{
    constructor ()
    {
        super(CommonSceneNames[1]);
    }

    create ()
    {
        console.log("Starting:", this.scene.key);

        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(88, 88, 'background')

        this.add.text(88, 88, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
