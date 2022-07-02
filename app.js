const size = 51
const center = Math.floor(size/2)
var block_rate = 0

const wallColor = "BLACK"
const openColor = "YELLOW"
const starColor = "WHITE"

const table = document.getElementById("grid")
const maze = new Array(size)
const cells = new Array(size)

for (var i = 0; i < size; i++) {
    maze[i] = new Array(size)
    cells[i] = new Array(size)
    table.insertRow(i)
    for (var j = 0; j < size; j++)
    {
        maze[i][j] = new Point (i,j)
        cells[i][j] = table.rows[i].insertCell(j)
    }
}

display()

function Point(x,y)
{
    this.x = x;
    this.y = y
    this.open = Math.random() > block_rate;

    this.neighbors = function ()
    {
        if (x < 0 || y < 0 || x >= size || y >= size ) return []

        neighbors = new Array()
        
        if (x != 0) neighbors.push(maze[x-1][y])
        if (y != 0) neighbors.push(maze[x][y-1])
        if (x != size - 1) neighbors.push(maze[x+1][y])
        if (y != size - 1) neighbors.push(maze[x][y+1])
        return neighbors
    }

    this.seed = function ()
    {
        seed = Math.random() > block_rate
        this.open = seed
        return seed
    }
}

function generate()
{
    update_block_rate()

    for (var i = 0; i < size; i++)
    {
        for (var j = 0; j < size; j++)
        {
            maze[i][j].seed()
        }
    }
    maze[0][0].open = true
    maze[0][size-1].open = true
    maze[size-1][0].open = true
    maze[size-1][size-1].open = true
    maze[center][center].open = true

    display()
    //console.log(validMaze())
}

function display()
{
    for (var i = 0; i < size; i++)
    {
        for (var j = 0; j < size; j++)
        {
            cells[i][j].setAttribute("bgcolor", maze[i][j].open ? openColor : wallColor)
        }
    }
    cells[0][0].setAttribute("bgcolor",starColor)
    cells[0][size-1].setAttribute("bgcolor",starColor)
    cells[size-1][0].setAttribute("bgcolor",starColor)
    cells[size-1][size-1].setAttribute("bgcolor",starColor)
    cells[center][center].setAttribute("bgcolor",starColor)
}

function update_block_rate()
{
    slider = document.getElementById("block_rate")
    block_rate =  slider.value
}

function pathExists(x1,y1,x2,y2)
{
    explored = []
    target = maze[x2][y2]
    if (!maze[x1][y1].open || !maze[x2][y2].open)
    {
        return false
    }

    q = maze[x1][y1].neighbors()

    while (q.length)
    {
        curr = q.pop()
        explored.push(curr)
        if (curr == target)
        {
            return true;
        }
        curr.neighbors().forEach(n => {
            if (n.open && explored.indexOf(n) == -1)
            {
                q.push(n)
            }
        });
    }
    return false
}

function shortestPathFrom(x,y)
{
    if (x < 0 || x >= size || y < 0 || y >= size || !maze[x][y].open)
    {
        console.error("invalid start point")
    }

    seen = []
    
    pq = [maze[x][y]]
    dist = new Array(size)
    unreachable = size**2+1
    for (var i = 0; i < size; i++) {
        dist[i] = new Array(size)
        for (var j = 0; j < size; j++)
        {
            dist[i][j] = unreachable
        }
    }
    dist[x][y] = 0;

    while(pq.length)
    {
        curr = pq.pop()
        seen.push(curr)
        
        curr.neighbors().forEach(n => {
            if (n.open)
            {
                dist[n.x][n.y] = Math.min(dist[n.x][n.y],dist[curr.x][curr.y]+1)
                if (seen.indexOf(n) == -1 && pq.indexOf(n) == -1)
                {
                    pq.push(n)
                }
            }
        });

        pq.sort((b,a) => dist[a.x][a.y]-dist[b.x][b.y])
    }

    return dist
}



function validMaze()
{
    d = shortestPathFrom(center,center)
    TL = d[0][0] < unreachable
    colorPath(0,0,d,"orange")
    TR = d[0][size-1] < unreachable
    colorPath(0,50,d,"cyan")
    BL = d[size-1][0] < unreachable
    colorPath(0,50,d,"green")
    BR = d[size-1][size-1] < unreachable
    colorPath(50,50,d,"magenta")
    
    /*
        TL = pathExists(0,0,center,center)
        colorMap("RED")
        BL = pathExists(size-1,0,center,center)
        colorMap("GREEN")
        TR = pathExists(0,size-1,center,center)
        colorMap("CYAN")
        BR = pathExists(size-1,size-1,center,center)
        colorMap("MAGENTA")
    */

    return TL && BL && TR && BR 
}

function colorPath(x,y,dist,color = "WHITE")
{
    p = maze[x][y]
    while (dist[p.x][p.y] != size**2+1 && dist[p.x][p.y])
    {
        cells[p.x][p.y].setAttribute("bgcolor",color)
        p = p.neighbors()
            .sort((a,b) => dist[b.x][b.y]-dist[a.x][a.y])
            .pop()
    }
}

function colorMap(color = starColor)
{
    explored.forEach(e => {
        cells[e.x][e.y].setAttribute("bgcolor",color)
    });
}