import Phaser from "phaser";

import ProceduralGenerationHelper from "./ProceduralGeneration/ProceduralGenerationHelper.mjs";

import CommonSceneNames from './CommonSceneNames.js';


//  Diffusion Aggregation algorithm, also known as Diffusion-Limited Aggregation (or DLA) algorithm
export class DiffusionAggregation extends Phaser.Scene
{
    // seed = "1234";

    // rnd = Phaser.Math.RND;

    // seededRandom = max => Phaser.Math.RND.frac() * max;

    // dynTex;

    // grid = [];

    // colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00, 0x0000ff];

    // tempVec = new Phaser.Math.Vector3();

    // directions = [Phaser.Math.Vector2.LEFT, Phaser.Math.Vector2.UP, Phaser.Math.Vector2.RIGHT, Phaser.Math.Vector2.DOWN];




    constructor()
    {
        super({
            key: CommonSceneNames[3],
            active: false,
            visible: false,
            plugins: [
                'Clock',  //this.time
                //'DataManagerPlugin',  //this.data
                'InputPlugin',  //this.input
                // 'Loader',  //this.load
                //'TweenManager',  //this.tweens
                //'LightsPlugin'  //this.lights
            ],
            cameras:
            {
                // height: 128,
                // width: 30,
                backgroundColor: "#225"
            }
        });
    }
    init()
    {
        // first of all, set the random generator!
        ProceduralGenerationHelper.rnd = Phaser.Math.RND;
        
        console.log(this.sys.settings.key);

        console.log(ProceduralGenerationHelper.setBaseSeed("PD!"));//Math.random()));

        console.log("BS:", ProceduralGenerationHelper.rnd.sow(ProceduralGenerationHelper.baseSeed + 1));

        console.log("PoissonDisc:", ProceduralGenerationHelper.poissonDiscSampler(16, 16, 7));

    }

    create()
    {

    }

    setupTexture(width, height, seed = this.seed)
    {

        // this.dynTex = this.textures.addDynamicTexture('gridTexture', width, height);

        // this.dynTex.fill(0x776655, 0.8);

        // this.immy = this.add.image(0, 0, "gridTexture").setOrigin(0).setScale(19);


        // this.rnd.sow(seed);

    }

    // generatePartitionedMap(width, height, partitionsAmount = this.colors.length, grid = this.grid)
    // {
    //     for (let i = 0; i < width; i++)
    //     {
    //         grid.push(new Array(height).fill(-1));
    //     }

    //     const visited = new Set();

    //     const partitions = new Map();

    //     for (let i = 0; i < partitionsAmount; i++)
    //     {
    //         partitions.add(i, new Set());
    //     }

    //     const {seededRandom} = this;
    // }

    setFirstPoint(partitions, width, height, iterable)
    {
        
    }

} // end Scene class

/*
class MainScene extends Phaser.Scene
{
    seed = "123456";

    rnd = Phaser.Math.RND; //.sow(this.seed);

    size = new Phaser.Math.Vector2(32, 32);

    oriColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0x666666, 0x9a9a9a];

    colors = Phaser.Display.Color.ColorSpectrum(32);


    alt = Phaser.Display.Color.HSVColorWheel();

    maxColor = 26;



    dynTex;

    

    constructor()
    {
        
        super({ key: "MainScene" });

        this.rnd.sow(this.seed);

        //console.log("SEEDED", this.rnd.frac())

        this.grid = [];

        console.log("COLORS", this.alt);

        //alt
        this.rnd.shuffle(this.alt);
        this.alt.length = this.maxColor;
        this.colors = this.alt;

        this.colors.forEach( (el, i, ary) => ary[i] = el.color);
    }

    create()
    {
        this.dynTex = this.textures.addDynamicTexture('gridTexture', this.size.x, this.size.y);

        this.dynTex.fill(0x776655, 0.8);

        this.immy = this.add.image(0, 0, "gridTexture").setOrigin(0).setScale(19);


        console.log(this.seed, this.rnd);

        const ary = [..."ABCDEF"];

        // console.log(this.rnd.shuffle(ary));

        const resut = this.generatePartitionedMap(this.size, this.colors.length);

        for (let y = 0; y < this.size.y; y++)
        {
            for (let x = 0, col; x < this.size.x; x++)
            {
                col = this.grid[y][x];
                // console.log(`x: ${x}, y: ${y}, col: ${col}`)
                this.dynTex.fill(this.colors[col], 1, x, y, 1, 1);
            }
        }
    }

    generatePartitionedMap(size_map, nb_subsections)
    {
        const {grid} = this;

        for (let i = 0; i < size_map.y; i++)
        {
            grid.push(new Array(size_map.x).fill(-1));
        }
        // Array.from({ length: size_map.x }, () => Array(size_map.y).fill(-1));
        
        // console.log("GRID", grid, size_map, nb_subsections);

        // Create a tracker for valid points by subsection for the diffusion process
        const recorded_points = Array.from({ length: nb_subsections }, () => []);

        // Create a counter to keep track of the number of unallocated cells
        let nb_free_cells = size_map.x * size_map.y;

        // Set up the initial points for the process
        const rng = () => Math.floor(this.rnd.frac() * size_map.x);
    
    for (let id_subsection = 0; id_subsection < nb_subsections; id_subsection++) {
        while (true) {
            // Find a random point
            const point = {
                x: rng(),
                y: Math.floor(this.rnd.frac() * size_map.y)
            };
            //console.log("POINT", point, grid)

            // Check if it's free, else find another point
            if (grid[point.x][point.y] === -1) {
                // If it is, add it to tracking and grid then proceed to next subsection
                grid[point.x][point.y] = id_subsection;
                recorded_points[id_subsection].push(point);
                nb_free_cells -= 1;

                break;
            }
        }
    }

    // Directions for diffusion process
    const directions = [
        { x: -1, y: 0 }, // left
        { x: 0, y: -1 }, // up
        { x: 1, y: 0 },  // right
        { x: 0, y: 1 }   // down
    ];

    // Start filling the grid
    while (nb_free_cells > 0) {
        for (let id_subsection = 0; id_subsection < nb_subsections; id_subsection++) {
            // Check if there are tracked points for this subsection
            if (recorded_points[id_subsection].length === 0) {
                continue;
            }

            // Choose a random point from the tracked points
            const id_curr_point = Math.floor(this.rnd.frac() * recorded_points[id_subsection].length);
            const curr_point = recorded_points[id_subsection][id_curr_point];

            // Choose a direction at random
            const direction = directions[Math.floor(this.rnd.frac() * directions.length)];
            const new_point = {
                x: curr_point.x + direction.x,
                y: curr_point.y + direction.y
            };

            // Check if the new point is in the grid
            if (new_point.x < 0 || new_point.y < 0 || new_point.x >= size_map.x || new_point.y >= size_map.y) {
                continue;
            }

            // Check if the new point is already occupied
            if (grid[new_point.x][new_point.y] !== -1) {
                continue;
            }

            // Record this new point in our tracker and set it in the grid
            grid[new_point.x][new_point.y] = id_subsection;
            recorded_points[id_subsection].push(new_point);
            nb_free_cells -= 1;
        }
    }

    return grid;
}

    //update(time)
    //{}
    
} // end Scene class

const game = new Phaser.Game({
    pixelArt: true,
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    backgroundColor: '#111111',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [ MainScene ]
})
*/