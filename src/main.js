import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { RayCastDDA } from './scenes/RayCastDDA.mjs';
import { DiffusionAggregation } from './scenes/DiffusionAggregation.mjs';
import { PmStroll } from './scenes/PmStroll_broken.mjs';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.WEBGL,
    pixelArt: true,
    backgroundColor: '#3fff22',
    disableContextMenu: true,
    scale:
    {
      mode: Phaser.Scale.NONE,
      //autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 256,
      height: 200,
      zoom: 3
    },
    input:
    {
      touch: false
    },  
    fps:
    {
      target: 50
    },
    // loader: {
    //   // baseURL: 'https://labs.phaser.io/',
    //   baseURL: 'https://i.ibb.co/YhGPn4S',
    //   crossOrigin: 'anonymous'
    //   },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver,
        RayCastDDA,
        DiffusionAggregation,
        PmStroll
    ]
};

export default new Phaser.Game(config);
