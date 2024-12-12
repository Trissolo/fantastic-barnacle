import Phaser from "phaser";

// Naive code to create 2D Voronoi this.cells (Cartesian plane)

export default class Voronoi
{
    static cells = []; // output

    static sites;

    static tempVect = new Phaser.Math.Vector2();

    static poly = new Phaser.Geom.Polygon();
    
  
    static compute(sites, pad)
	{ // pad: box padding
        var boundary = this.points_boundary(sites);

        var x_left = boundary[0] - pad;   // min x
        var y_bottom = boundary[1] - pad; // min y
        var x_right = boundary[2] + pad;  // max x
        var y_top = boundary[3] + pad;    // max y

       // var sites = this.preprocess_sites(sites);

        var n = sites.length;

        var voronoi_box = [
            [x_left,y_top], [x_right,y_top],
            [x_right,y_bottom], [x_left,y_bottom]
        ];

        for (let i = 0; i < n; i++){
            var cell = voronoi_box;

            var current_site = sites[i];

            for (let j = i; j < n; j++)
            {
                //if (i == j) continue;

                var m = cell.length;

                var new_cell = [];

                var next_site = sites[j];

                var bisector = this.two_points_bisector(current_site, next_site);

                if (bisector[0] == 0 && bisector[1] == 0) continue;

                for (let k = 0; k < m; k++){
                    var current_vertex = cell[k];

                    var next_vertex = cell[(k+1)%m];

                    var first_intersection = this.line_and_segment_intersection(bisector, current_vertex, next_vertex);

                    if (first_intersection)
                    {
                        var intersection_is_next_vertex = (first_intersection[0] == next_vertex[0]) && (first_intersection[1] == next_vertex[1]);

                        if (intersection_is_next_vertex)
                        {
                            new_cell.push(next_vertex, cell[(k+2)%m]);
                            var first_intersection_index = (k+2)%m;
                        }
                        else
                        {
                            new_cell.push(first_intersection, next_vertex);

                            var first_intersection_index = (k+1)%m;
                        }

                        break;
                    }
                }

                if (new_cell.length == 0)
                {
                    new_cell = cell;
                }
                else
                {
                    for (let k=first_intersection_index; k < m; k++){
                        var current_vertex = cell[k];

                        var next_vertex = cell[(k+1)%m];

                        var second_intersection = this.line_and_segment_intersection(bisector, current_vertex, next_vertex);

                        if (second_intersection)
                        {
                            new_cell.push(second_intersection);

                            var second_intersection_index = k+1;

                            break;
                        }
                        else
                        {
                            new_cell.push(next_vertex);
                        }
                    }

                    if (!this.is_point_in_polygon(current_site, new_cell)){
                        new_cell = this.two_points_equal(second_intersection, cell[second_intersection_index%m]) ? [] : [second_intersection];

                        for (let k = second_intersection_index; k%m > first_intersection_index || k%m < first_intersection_index; k++){
                            var v1 = cell[k%m];
                            var v2 = cell[(k+1)%m];

                            if (this.two_points_equal(v1, v2)) continue;

                            new_cell.push(v1);
                        }

                        if (!this.two_points_equal(first_intersection, v1)) new_cell.push(first_intersection);
                    }
                }

                cell = new_cell;
            }

            if (cell.length > 0)
            {
                this.cells.push(cell);
            }
            else
            {
                this.cells.push(null);
            }
        }

        return {sites: sites, cells: this.cells};
    }

    static preprocess_sites(sites)
	{
        // REMOVE REPEATED POINTS
        var new_sites = [...new Map(sites.map(x => [JSON.stringify(x), x])).values()];

        // THIS MAY HELP WITH FLOATING POINTS ISSUES
        var magnitude = this.max_xy(new_sites),
            mag_x = this.eps*magnitude[0]*100,
            mag_y = this.eps*magnitude[1]*100;

        for (let i = 0; i < new_sites.length; i++){
            new_sites[i][0] = new_sites[i][0]+this.random(0,mag_x);
            new_sites[i][1] = new_sites[i][1]+this.random(0,mag_y);
        }

        return new_sites;
    }

    static max_xy(points)
	{
        var x = Math.abs(points[0][0]), y = Math.abs(points[0][1]);

        for (let i = 1; i < points.length; i++){
            var x1 = Math.abs(points[i][0]), y1 = Math.abs(points[i][1]);

            if (x1 > x) x = x1;
            if (y1 > y) y = y1;
        }

        x = x > 1 ? x : 1;
        y = y > 1 ? y : 1;

        return [x,y];
    }

    static two_points_equal(a,b)
	{
        if ((a[0] == b[0]) && a[1] == b[1]) return true;
    }

    static random(min, max)
	{
        return Math.random() * (max - min) + min;
    }

    static points_boundary(points)
	{
		var max_x = points[0][0];
        var min_x = max_x;
		let max_y = points[0][1];
        var min_y = max_y;

        for (let i = 1; i < points.length; i++){
            var x = points[i][0], y = points[i][1];

            if (x < min_x) min_x = x;
            if (x > max_x) max_x = x;
            if (y < min_y) min_y = y;
            if (y > max_y) max_y = y;
        }

        return [min_x, min_y,max_x,max_y];
    }

    static two_points_bisector(A, B)
	{ // ax + by + c = 0
        var midpoint = [(A[0]+B[0])/2, (A[1]+B[1])/2];

        var a = B[0] - A[0];
        var b = B[1] - A[1];
        var c = -midpoint[0]*a - midpoint[1]*b;

        return [a,b,c];
    }

    static isclose(a, b, tolerance = this.eps)
	{
        return Math.abs(a - b) < tolerance;
    }

    static cross_prod(a, b)
	{ // a, b: 3D vectors (arrays)
        var a1 = a[0], a2 = a[1], a3 = a[2];
        var b1 = b[0], b2 = b[1], b3 = b[2];

        var s1 = a2*b3 - a3*b2;
        var s2 = a3*b1 - a1*b3;
        var s3 = a1*b2 - a2*b1;

        return [s1, s2, s3];
    }

    static line_and_segment_intersection(line, A, B)
	{ // intersection between line and segment AB
        var a = A[1] - B[1];
        var b = B[0] - A[0];
        var c = A[0]*B[1] - B[0]*A[1];

        var AB_line = [a,b,c]; // ax + by + c = 0

        if ((line[0]/line[1] == AB_line[0]/AB_line[1]) && (line[2]/line[1] == AB_line[2]/AB_line[1])){
            return null;
        }

        var p = this.cross_prod(line, AB_line);

        if ((p[2] == 0)){ // the lines do not intersect
            return null;
        }
        else
        {
            var intersection = [p[0]/p[2], p[1]/p[2]];

            var is_vertical = this.isclose(A[0], B[0]); // AB is "vertical"
            var is_horizontal = this.isclose(A[1], B[1]); // AB is "horizontal"
            var is_endpoint_y = this.isclose(intersection[1], A[1]) || this.isclose(intersection[1], B[1]); // intersection is an endpoint
            var is_endpoint_x = this.isclose(intersection[0], A[0]) || this.isclose(intersection[0], B[0]); // intersection is an endpoint
            var is_between_x_axis = (intersection[0] < A[0]) != (intersection[0] < B[0]); // intersection is between AB x-axis
            var is_between_y_axis = (intersection[1] < A[1]) != (intersection[1] < B[1]); // intersection is between AB y-axis
            var is_between_AB = is_between_x_axis && is_between_y_axis; // intersection is between AB

            if (is_vertical && (is_endpoint_y || is_between_y_axis)) return intersection;
            else if (is_horizontal && (is_endpoint_x || is_between_x_axis)) return intersection;
            else if (is_between_AB) return intersection;
            else return null;
        }
    }

    static cross_2D(u,v)
	{
        return u[0]*v[1] - u[1]*v[0];
    }

    static is_point_in_polygon(point, polygon)
	{ // convex polygon
        var n = polygon.length;
        
        for (let i = 0; i < n; i++)
        {
            var t = [polygon[i][0] - polygon[(i+1)%n][0], polygon[i][1] - polygon[(i+1)%n][1]];
            var u = [point[0] - polygon[(i+1)%n][0], point[1] - polygon[(i+1)%n][1]];
            var v = [polygon[(i+2)%n][0] - polygon[(i+1)%n][0], polygon[(i+2)%n][1] - polygon[(i+1)%n][1]];

            if (!(this.cross_2D(t,u)*this.cross_2D(t,v) >= 0 && this.cross_2D(v,u)*this.cross_2D(v,t) >= 0)){
                return false;
            }
        }

        return true;
    }

    static eps = Math.pow(2,-23);

    static infLineInters(line1, segment, out = this.point)
    {
        const {x1, y1, x2, y2} = line1;
    
        const {x1: x3, y1: y3, x2: x4, y2: y4} = segment;
    
        //  Check that none of the lines are length zero
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4))
        {
            return false;
        }
    
        var denom = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    
        //  Make sure there is not a division by zero - this also indicates that the lines are parallel.
        //  If numA and numB were both equal to zero the lines would be on top of each other (coincidental).
        //  This check is not done because it is not necessary for this implementation (the parallel check accounts for this).
    
        if (denom === 0)
        {
            //  Lines are parallel
            return false;
        }
    
        //  Calculate the intermediate fractional point that the lines potentially intersect.
    
        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    
        //  The fractional point will be between 0 and 1 inclusive if the lines intersect.
        //  If the fractional calculation is larger than 1 or smaller than 0 the lines would need to be longer to intersect.
    
        // if (ua < 0 || ua > 1 || ub < 0 || ub > 1)
        if (ub < 0 || ub > 1)
        {
            return false;
        }
        else
        {
            // console.log("ua", ua, "ub", ub)

            out.x = x1 + ua * (x2 - x1);
            out.y = y1 + ua * (y2 - y1);

            return true;
        }
      
    /*
        else
        {
            if (out)
            {
                out.x = x1 + ua * (x2 - x1);
                out.y = y1 + ua * (y2 - y1);
            }
    
            return true;
        }*/
    }
}
//=================================================================

// const points = [[1,3],[2,2],[8,8],[2,1]]
// const padding = 1;

// const {sites, cells} =  Voronoi.compute(points, padding);


// console.log(sites, cells);

