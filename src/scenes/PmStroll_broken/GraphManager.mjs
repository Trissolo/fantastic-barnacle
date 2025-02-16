export default class GraphManager
{
    static addNode(node, graph)
    {
        graph.set(node, new Map());
    }

    static addEdge(node, neighbor, dist, graph)
    {             
        if (graph.get(node).has(neighbor))
        {
            return;
        }

        graph.get(node).set(neighbor, dist);

        graph.get(neighbor).set(node, dist);
    }

    static cloneGraph(graph)
    {
        const clone = new Map();

        for (const [orig, container] of graph)
        {
            clone.set(orig, new Map(container));
        }

        return clone;
    }

    static destroyGraph(graph)
    {
        for (const value of graph.values())
        {
            value.clear();
        }

        return graph.clear();
    }

    static graphToString(graph)
    {
        let res = `Visibility Map (${graph.size})\n`;
        
        for (const [pointA, edges] of graph)
        {
            let stringEdges = "";
            
            for (const [pointB, distance] of edges)
            {
                stringEdges += `\n├── {x: ${pointB.x}, y: ${pointB.y}} -> ${distance}`;
            }
            res += `\n\n{x: ${pointA.x}, y: ${pointA.y}}\n|` + stringEdges+"\n\t";
        }
        
        return res;
    }
}
