export default class PMDebug
{
    // scene;
    // graphics;

    constructor(scene)
    {
        this.scene = scene;
        this.graphics = scene.add.graphics(0, 0);
    }

    fillStyle(color = 0xffffff, alpha = 1)
    {
        this.graphics.fillStyle(color, alpha);
    }

    clear()
    {
        this.graphics.clear();

        return this;
    }

    showPolygons(polygonalMap)
    {
        const {graphics} = this;

        //set color of walkable area
        this.fillStyle(0x333333);
		
        for (const {points} of polygonalMap.polygons)//.values())
        {
            graphics.fillPoints(points, true, false);

            // set color for obstacles
            this.fillStyle(0x777777);
        }

        this.fillStyle(0x575799);
			
        //show concave
        for (const vertex of polygonalMap.graph.keys())
        {
            graphics.fillPoint(vertex.x, vertex.y, 3);
        }
    }

    lineFromVecs(vecA, vecB, color = 0xf4f499)
    {
        // this.setLineColor(color);
        this.graphics.lineStyle(1, color, 0.2);

        if (vecB)
        {
            this.graphics.lineBetween(vecA.x, vecA.y, vecB.x, vecB.y);
        }
        else
        {
            this.graphics.strokeLineShape(vecA);
        }
    }

    showGraph(graph, clearBefore = true)
    {
        if (clearBefore)
        {
            this.graphics.clear();
        }

        for(const [node, edges] of graph)
        {
            for(const neigh of edges.keys())
            {
                this.lineFromVecs(node, neigh);
            }
        }
    }

    showPath(vecAry, startVector, color = 0xffff99)
	{
        // this.setLineColor(color);
        this.graphics.lineStyle(1, color, 1)
                    .strokePoints(startVector? [...vecAry, startVector]: vecAry, false, false);
	}

    drawPolyMap(polygonalMap)
    {
        // this.graphics.clear();

        for(const [node, neighborContainer] of polygonalMap.graph)
        {
            this.graphics.fillCircle(node.x, node.y, 3);

            for (const neighbor of neighborContainer.keys())
            {
                // console.log(neighborContainer === polygonalMap.graph.get(node), "clone size:", neighborContainer.size)
                this.lineFromVecs(node, neighbor, 0xffffca)// Phaser.Math.Between(0x9aff00, 0xffff9a))
            }
        }
    }
}
