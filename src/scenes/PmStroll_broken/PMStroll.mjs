import AnyAgainstAllOthers from "./generators/AnyAgainstAllOthers.mjs";

import EachPolygonSide from "./generators/EachPolygonSide.mjs";

import EachVectorAndAdjacents from "./generators/EachVectorAndAdjacents.mjs";

import VisibilityMap from "./VisibilityMap.mjs";

import GraphManager from "./GraphManager.mjs";


class PMStroll
{
    // optional
    // debug;

    // // defaults:
    // epsilon = 0.03;

    // splitAmount = 5;

    // // for recycle:
    // vertexA = new Phaser.Math.Vector2();

    // vertexB = new Phaser.Math.Vector2();

    // out = new Phaser.Math.Vector2();


    constructor(scene)
    {
        console.log(scene)
        if (scene)
        {
            this.debug = new PMDebug(scene);

        }
        this.debug;

        // defaults:
        this.epsilon = 0.03;
    
        this.splitAmount = 5;
    
        // for recycle:
        this.vertexA = new Phaser.Math.Vector2();
    
        this.vertexB = new Phaser.Math.Vector2();
    
        this.out = new Phaser.Math.Vector2();

    }

    // yest simple add
    addVisibilityMap(aryOfNumberArys)
    {
        const pm = new VisibilityMap(aryOfNumberArys);

        this.grabConcave(pm);

        this.checkAdjacent(pm);

        this.connectNodes(pm);


        // this.polygonalMaps.set(name, pm);

        // this.drawPolyMap(pm);

        console.dir("PM", pm);

        return pm
    }

    grabConcave(polygonalMap)
    {
        const {vertexA, vertexB} = this;
        
        let isFirstPoly = true;
        
        //iterate allwalkable poly
        for (const {points} of polygonalMap.polygons)
        {
            //iterate all vertices in each poly
            for(const [curr, succ, prec] of EachVectorAndAdjacents(points))
            {
            
                vertexA.copy(succ).subtract(curr);

                vertexB.copy(curr).subtract(prec);

                
                if( (vertexB.cross(vertexA) < 0) === isFirstPoly)
                {
                    GraphManager.addNode(curr, polygonalMap.graph)
                }
            
            }
            
            // after the first iteration, i.e. *from now*, 'isFirstPoly' must be false
            isFirstPoly = false;
        
        }
        
    } // end grabConcave


    checkAdjacent(polygonalMap)
    {
        const {graph} = polygonalMap;

        for (const polygon of polygonalMap.polygons)
        {

            // EachPolygonSide
            for (const [sidePointA, sidePointB] of EachPolygonSide(polygon.points))
            {
                if (graph.has(sidePointA) && graph.has(sidePointB))
                {
                    GraphManager.addEdge(sidePointA, sidePointB, heuristic(sidePointA, sidePointB), graph);
                }
            }
        }
    } // end checkAdjacent

    connectNodes(polygonalMap, graph = polygonalMap.graph)
    {
        for (const [concaveA, concaveB] of AnyAgainstAllOthers([...graph.keys()]))
        {
            if (this.quickInLineOfSight(concaveA, concaveB, polygonalMap))
            {
                GraphManager.addEdge(concaveA, concaveB, heuristic(concaveA, concaveB), graph)
            }
        }
    }

    quickInLineOfSight(start, end, polygonalMap)
    {
        //the segment to check against any polygon side
        const ray = new Phaser.Geom.Line()
        .setFromObjects(start, end);

        //One side of current polygon
        const polygonSide = new Phaser.Geom.Line();

        // temp Vector2
        const tempVec2 = new Phaser.Math.Vector2()

        for (const {points} of polygonalMap.polygons)
        {
            for (const [sidePointA, sidePointB] of EachPolygonSide(points))
            {
                polygonSide.setFromObjects(sidePointA, sidePointB);

                if (LineToLine(ray, polygonSide, this.out) && !this.itsNear(start, end, sidePointA, sidePointB, tempVec2))
                {
                    return false
                }
            }
        }

        //another loop?
        const rayPoints = ray.getPoints(this.splitAmount);

        rayPoints[0] = GetMidPoint(ray);

        let firstagain = false;

        for (const poly of polygonalMap.polygons)
        {
            // if (rayPoints.some((point, idx, ary) => poly.contains(point.x, point.y) === firstagain))
            if (rayPoints.some(this.isContained, poly) === firstagain)
            {
                return false
            }

            firstagain = true;
        }

        return true

    } // end quickInLineOfSight

    itsNear(rayA, rayB, sideA, sideB, recycledVec = new Phaser.Math.Vector2())
    {
        return (recycledVec.setFromObject(rayA).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayB).fuzzyEquals(sideB, this.epsilon)) || (recycledVec.setFromObject(rayB).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayA).fuzzyEquals(sideB, this.epsilon));
    }

    isContained(point, idx, ary)
    {
        // if (rayPoints.some((point, idx, ary) => poly.contains(point.x, point.y) === firstagain))
        //console.log(`Poly (${this.points.length}) contains {x: ${point.x}, y: ${point.y}}`, this.contains(point.x, point.y));

        return this.contains(point.x, point.y);
    }

    addExtraNodeToClonedGraph(extraNode, clonedGraph, graphKeys, originalPolygonalMap)
    {
        GraphManager.addNode(extraNode, clonedGraph);

        for (const node of graphKeys) //  for (let i = 0; i < limit; i++)
        {
            // const node = graphKeys[i];

            if (this.quickInLineOfSight(extraNode, node, originalPolygonalMap))
            {
                GraphManager.addEdge(extraNode, node, heuristic(extraNode, node), clonedGraph);
            }
        }

        //just in case...
        return clonedGraph;
    }

    prepareGraph(start, end, polygonalMap)
    {
        // 1) Clone the Graph:
        const clonedGraph = GraphManager.cloneGraph(polygonalMap.graph);

        // console.log("Current clonedGraph size", clonedGraph.size)

        // 2) Extract the Keys (extract the keys, which are used to create the edges of the new node):
        const graphKeys = [...clonedGraph.keys()];

        // 3) the highest node index - when creating edges you don't need to go further
        //let {length} = graphKeys;

        // 4) Add and connect the new Node
        this.addExtraNodeToClonedGraph(start, clonedGraph, graphKeys, polygonalMap);

        // 5) Before add the second new node update the Keys and 'length'
        graphKeys.push(start);

        //6) 'length'
        //length += 1;

        // 7) Add the 'end' node
        this.addExtraNodeToClonedGraph(end, clonedGraph, graphKeys, polygonalMap);

        // this.debug.showGraph(clonedGraph);

        //done!
        return clonedGraph
    }

    pathDijkstra(start, end, polygonalMap)
    {
        start = vector2LikeFromObject(start);
        end = vector2LikeFromObject(end);

        const clonedGraph = this.prepareGraph(start, end, polygonalMap);

        return new Dijkstra(start, end, clonedGraph).search();

    }  // end pathDijkstra

    pathAStar(start, end, polygonalMap)
    {
        start = vector2LikeFromObject(start);
        end = vector2LikeFromObject(end);

        const clonedGraph = this.prepareGraph(start, end, polygonalMap);

        return new Astar(start, end, clonedGraph, heuristic).search();

    } // end pathAStar

}
