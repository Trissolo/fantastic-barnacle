import { Scene } from 'phaser';

import CommonSceneNames from './CommonSceneNames.js';

export class PmStroll extends Scene
{
    constructor ()
    {
        super(CommonSceneNames[4]);
    }

    create ()
    {
        console.log("Starting:", this.scene.key);

        this.cameras.main.setBackgroundColor(0x232323);

        

        this.input.once(Phaser.Input.Keyboard.Events.KEY_DOWN + "ESC", () => {

            this.scene.switch('MainMenu');
        });
    }
}
