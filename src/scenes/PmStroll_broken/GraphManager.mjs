export default class GraphManager
{
    static addNode(node, graph)
    {
        graph.set(node, new Map());

        // return node
    }

    // static edgesContainerOf(node, graph)
    // {
    //     return graph.get(node);
    // }

    static edgeAlreadyExists(node, neighbor, graph)
    {
        // original:
        // return graph.has(node) && graph.get(node).has(neighbor);

        // recent code (works), maybe too redundant:
        // return graph.get(node).has(neighbor) && graph.get(neighbor).has(node);

        // quick test
        return graph.get(node).has(neighbor);
    }

    static addEdge(node, neighbor, dist, graph)
    {
        // Paranoid check
        if (!graph.has(node))
        {
            console.error(node, "Node is absent. Aborting");
        }

        if (!graph.has(neighbor))
        {
            console.error(neighbor, "For some reason 'point A' is present in the graph, but point B (neighbor) is not. Aborting.");
        }
        
        
        if (graph.get(node).has(neighbor))
        {
            return; // console.log("%cEdge already present", node !== neighbor? "background-color:#2378db": "background-color:#666", node, neighbor);
        }

        graph.get(node).set(neighbor, dist);

        graph.get(neighbor).set(node, dist);

        // original code
        // if (!this.edgeAlreadyExists(node, neighbor, graph))
        // {
        //     graph.get(node).set(neighbor, dist);

        //     graph.get(neighbor).set(node, dist);
        // }
    }

    static cloneGraph(graph)
    {
        const cloneGraph = new Map();

        for (const [orig, container] of graph)
        {
            cloneGraph.set(orig, new Map(container));

            // const cloneCont = new Map();

            // cloneGraph.set(orig, cloneCont);

            // for (const [neigh, dist] of container)
            // {
            //     cloneCont.set(neigh, dist);
            // }

        }

        return cloneGraph;
    }

    static destroyGraph(graph)
    {
        for (const val of graph.values())
        {
            val.clear()
        }

        // for (const [orig, container] of graph)
        // {
        //     graph.get(orig).clear();
        // }

        return graph.clear();

        // for (const [orig, container] of graph)
        // {
        //     console.log("(After) %o -> %o", orig, graph.get(orig));
        // }
        
        // return graph;
    }

    static graphToString(graph)
    {
        let res = `Visibility Map (${graph.size})\n`;
        
        for (const [pointA, edges] of graph)
        {
           let stringEdges = "";
           
           for (const [pointB, distance] of edges)
           {
             stringEdges += `\n├── {x: ${pointB.x}, y: ${pointB.y}} -> ${distance}`
           }
           res += `\n\n{x: ${pointA.x}, y: ${pointA.y}}\n|` + stringEdges+"\n\t";
        }
        
      return res;
    }
}
