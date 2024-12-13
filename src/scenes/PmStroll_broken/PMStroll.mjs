import Phaser from "phaser";

import PMDebug from "./pmdebug/PMDebug.mjs";

import Dijkstra from "./pathfinding/Dijkstra.mjs";

import AStar from "./pathfinding/AStar.mjs";

const {BetweenPoints: heuristic} = Phaser.Math.Distance;

const {GetMidPoint} = Phaser.Geom.Line;

const {LineToLine} = Phaser.Geom.Intersects;

function vector2LikeFromObject(obj)
{
    return {x: obj.x, y: obj.y};
}


import AnyAgainstAllOthers from "./generators/AnyAgainstAllOthers.mjs";

import EachPolygonSide from "./generators/EachPolygonSide.mjs";

import EachVectorAndAdjacents from "./generators/EachVectorAndAdjacents.mjs";


import VisibilityMap from "./VisibilityMap.mjs";

import GraphManager from "./GraphManager.mjs";


export default class PMStroll
{
    // optional
    // debug;

    // defaults:
    epsilon = 0.03;

    splitAmount = 5;

    // for recycle:
    vertexA = new Phaser.Math.Vector2();

    vertexB = new Phaser.Math.Vector2();

    out = new Phaser.Math.Vector2();


    constructor(scene)
    {
        // console.log(scene);

        if (scene)
        {
            this.debug = new PMDebug(scene);
        }
    }

    // test simple add
    addVisibilityMap(aryOfPhaserPolygonParams)
    {
        const visMap = new VisibilityMap(aryOfPhaserPolygonParams);

        this.grabConcave(visMap)
            .checkAdjacent(visMap)
            .connectNodes(visMap);

        // this.visibilityMaps.set(name, visMap);

        console.dir("new VisibilityMap", visMap);

        return visMap;
    }

    grabConcave(visibilityMap)
    {
        const {vertexA, vertexB} = this;
        
        let isFirstPoly = true;
        
        //iterate allwalkable poly
        for (const {points} of visibilityMap.polygons)
        {
            //iterate all vertices in each poly
            for(const [curr, succ, prec] of EachVectorAndAdjacents(points))
            {
            
                vertexA.copy(succ).subtract(curr);

                vertexB.copy(curr).subtract(prec);

                
                if( (vertexB.cross(vertexA) < 0) === isFirstPoly )
                {
                    GraphManager.addNode(curr, visibilityMap.graph);
                }
            
            }
            
            // after the first iteration, i.e. *from now*, 'isFirstPoly' must be false
            isFirstPoly = false;
        
        }

        return this;
        
    } // end grabConcave


    checkAdjacent(visibilityMap)
    {
        const {graph} = visibilityMap;

        for (const polygon of visibilityMap.polygons)
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

        return this;

    } // end checkAdjacent

    connectNodes(visibilityMap, graph = visibilityMap.graph)
    {
        for (const [concaveA, concaveB] of AnyAgainstAllOthers([...graph.keys()]))
        {
            if (this.quickInLineOfSight(concaveA, concaveB, visibilityMap))
            {
                GraphManager.addEdge(concaveA, concaveB, heuristic(concaveA, concaveB), graph);
            }
        }
    }

    quickInLineOfSight(start, end, visibilityMap)
    {
        //the segment to check against any polygon side
        const ray = new Phaser.Geom.Line().setFromObjects(start, end);

        //One side of current polygon
        const polygonSide = new Phaser.Geom.Line();

        // recycled Vector2
        const tempVec = new Phaser.Math.Vector2();

        for (const {points} of visibilityMap.polygons)
        {
            for (const [sidePointA, sidePointB] of EachPolygonSide(points))
            {
                polygonSide.setFromObjects(sidePointA, sidePointB);

                if (LineToLine(ray, polygonSide, this.out) && !this.itsNear(start, end, sidePointA, sidePointB, tempVec))
                {
                    return false;
                }
            }
        }

        //another loop?
        const rayPoints = ray.getPoints(this.splitAmount);

        rayPoints[0] = GetMidPoint(ray);

        let firstagain = false;

        for (const poly of visibilityMap.polygons)
        {
            if (rayPoints.some(this.isContained, poly) === firstagain)
            {
                return false;
            }

            firstagain = true;
        }

        return true;

    } // end quickInLineOfSight

    itsNear(rayA, rayB, sideA, sideB, recycledVec = new Phaser.Math.Vector2())
    {
        return (recycledVec.setFromObject(rayA).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayB).fuzzyEquals(sideB, this.epsilon)) || (recycledVec.setFromObject(rayB).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayA).fuzzyEquals(sideB, this.epsilon));
    }

    isContained(point) //, idx, ary)
    {
        return this.contains(point.x, point.y);
    }

    // addExtraNodeToClonedGraph(extraNode, clonedGraph, graphKeys, originalvisibilityMap)
    // {
    //     GraphManager.addNode(extraNode, clonedGraph);

    //     for (const node of graphKeys) //  for (let i = 0; i < limit; i++)
    //     {
    //         // const node = graphKeys[i];

    //         if (this.quickInLineOfSight(extraNode, node, originalvisibilityMap))
    //         {
    //             GraphManager.addEdge(extraNode, node, heuristic(extraNode, node), clonedGraph);
    //         }
    //     }

    //     //just in case...
    //     return clonedGraph;
    // }

    prepareGraph(start, end, visibilityMap)
    {
        // 1) Clone the Graph:
        const clonedGraph = GraphManager.cloneGraph(visibilityMap.graph);

        // 2) Extract the Keys (extract the keys, which are used to create the edges of the new node):
        const graphKeys = [...clonedGraph.keys()];

        for (const newVertex of [start, end])
        {
            GraphManager.addNode(newVertex, clonedGraph);

            for (const existingVertex of graphKeys)
            {
    
                if (this.quickInLineOfSight(newVertex, existingVertex, visibilityMap))
                {
                    GraphManager.addEdge(newVertex, existingVertex, heuristic(newVertex, existingVertex), clonedGraph);
                }
            }

            // From now, the 'newVertex' belongs in the graph, so add it to
            graphKeys.push(newVertex);
        }

        return clonedGraph;
    }

    pathDijkstra(start, end, visibilityMap)
    {
        start = vector2LikeFromObject(start);
        end = vector2LikeFromObject(end);

        const clonedGraph = this.prepareGraph(start, end, visibilityMap);

        return new Dijkstra(start, end, clonedGraph).search();

    }  // end pathDijkstra

    pathAStar(start, end, visibilityMap)
    {
        start = vector2LikeFromObject(start);
        end = vector2LikeFromObject(end);

        const clonedGraph = this.prepareGraph(start, end, visibilityMap);

        return new AStar(start, end, clonedGraph, heuristic).search();

    } // end pathAStar

}
