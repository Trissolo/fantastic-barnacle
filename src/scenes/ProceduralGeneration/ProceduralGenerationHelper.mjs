import Phaser from "phaser";


const {SpliceOne} = Phaser.Utils.Array;


export default class ProceduralGenerationHelper
{
    static rnd; // = Phaser.Math.RND || new Phaser.Math.RandomDataGenerator();
    
    static baseSeed = "";
    
    static tempVec = new Phaser.Math.Vector2();
    
    static rect = new Phaser.Geom.Rectangle();

    static setBaseSeed(baseSeed)
    {
        this.baseSeed = `${baseSeed}`;

        return this;
    }

    static random(max = 1)
    {
        return Math.floor(this.rnd.frac() * max);
    }

// PoissonDisc stuff:
// based on Martin Roberts's modification of Mike Bostock's implementation

// https://observablehq.com/@techsparx/an-improvement-on-bridsons-algorithm-for-poisson-disc-samp/2

    static k = 10; // maximum number of samples before rejection
    static radius2 = 0;
    static cellSize = 0;
    static gridWidth = 0;
    static gridHeight = 0;
    static result = new Map();
    static queue = [];

    static poissonDiscSampler(width, height, radius)
    {
        this.rect.setSize(width, height);

        this.result.clear();
        
        this.queue.length = 0;

        this.radius2 = radius * radius;
        this.cellSize = radius * Math.SQRT1_2;
        this.gridWidth = Math.ceil(width / this.cellSize);
        this.gridHeight = Math.ceil(height / this.cellSize);

        // Pick the first sample.
        /*const first =*/ this.sample(width / 2 , height / 2, null);
        //yield graphics.fillCircle(first.x, first.y, this.filledRadius);

        // Pick a random existing sample from the queue.
        pick: while (this.queue.length)
        {
            console.log("pick");

            const randIdx = this.random(this.queue.length);  //Math.random() * queue.length | 0;

            const parent = this.queue[randIdx];

            const seed = this.rnd.frac();  //Math.random();

            // const epsilon = Phaser.Math.EPSILON;//0.0000001;


            // Make a new candidate.
            for (let j = 0; j < this.k; ++j)
            {
                // const a = 2 * Math.PI * (seed /*+ 1.0*/ + j / k);
                
                // const r = radius + Phaser.Math.EPSILON;
                
                // const x = parent.x + r * Math.cos(a);
                // const y = parent.y + r * Math.sin(a);
                
                const {x, y} = this.tempVec.setToPolar(Phaser.Math.PI2 * (seed + j / this.k), radius + Phaser.Math.EPSILON).add(parent);//new Phaser.Math.Vector2().setToPolar(Phaser.Math.PI2 * (seed + j / k), radius + Phaser.Math.EPSILON).add(parent);
                
                // Accept candidates that are inside the allowed extent
                // and farther than 2 * radius to all existing samples.
                if (this.zeroContains(this.rect, x, y) && this.far(x, y))  //(0 <= x && x < width && 0 <= y && y < height && far(x, y)) y))
                {
                    this.sample(x, y, parent);
            
                    continue pick;
                }
            }

            // If none of k candidates were accepted, remove it from the queue.
            SpliceOne(this.queue, randIdx);

        }

        return this.result;
    }

    static far(x, y)
    {
        const currGridX = Math.floor(x / this.cellSize);
        const currGridY = Math.floor(y / this.cellSize);
        const i0 = Math.max(currGridX - 2, 0);
        const j0 = Math.max(currGridY - 2, 0);
        const i1 = Math.min(currGridX + 3, this.gridWidth);
        const j1 = Math.min(currGridY + 3, this.gridHeight);

        for (let j = j0; j < j1; ++j)
        {
            const horComp = j * this.gridWidth;

            for (let i = i0; i < i1; ++i)
            {
                if (this.result.has(horComp + i) && this
                .tempVec
                .setFromObject(this.result.get(horComp + i))
                .subtract({x, y})
                .dot(this.tempVec) < this.radius2)
                {
                    return false;
                }

                /* // old code:
                if (this.result.has(horComp + i))
                {
                    const s = this.result.get(horComp + i);
                    const dx = s.x - x;
                    const dy = s.y - y;

                    this.tempVec.setFromObject(s).subtract({x, y});

                    console.log("DEBU far()", this.tempVec.dot(this.tempVec), dx * dx + dy * dy); //.subtract({x,y}), dx, dy);

                    if (dx * dx + dy * dy < this.radius2)
                    {
                        return false;
                    }
                }*/
            }
        }
        return true;
    }

    static sample(x, y) //, parent = null)
    {
        const samp = new Phaser.Math.Vector2(x, y);
        
        this.queue.push(samp);
        
        this.result.set(this.gridWidth * Math.floor(y / this.cellSize) + Math.floor(x / this.cellSize), samp);
        
        return samp;
    }

    static zeroContains(rect, x, y)
    {
        if (rect.width <= 0 || rect.height <= 0)
        {
            return false;
        }

        return (rect.x <= x && rect.x + rect.width > x && rect.y <= y && rect.y + rect.height > y);
    }
}
