const size = 51
const center = Math.floor(size/2)
var block_rate = 0.3
const unreachable = size**2+1

const wallColor = "401500"
const openColor = "FFFF80"
const starColor = "gold"


const table = document.getElementById("grid")
const maze = new Array(size)
const cells = new Array(size)

var selected = []

for (var i = 0; i < size; i++)
{
    maze[i] = new Array(size)
    cells[i] = new Array(size)
    table.insertRow(i)
    for (var j = 0; j < size; j++)
    {
        maze[i][j] = new Point (j,i)
        cells[i][j] = table.rows[i].insertCell(j)
        cells[i][j].setAttribute("class","maze-cell")
        cells[i][j].setAttribute("onclick","select(event)")
    }
}

generate()
display()

function select(event)
{
    var x = event.path[0].cellIndex
    var y = event.path[1].rowIndex

    if (!maze[y][x].open)
    {
        console.log("blocked point")
        return
    }

    event.target.setAttribute("bgcolor",starColor)
    selected.push(maze[y][x])

    if (selected.length == 2)
    {
        end = selected.pop()
        start = selected.pop()

        path = shortestPathFrom(end.x,end.y)

        if (path[start.y][start.x] != unreachable)
        {
            console.log("path found from",start.x,start.y,"to",end.x,end.y)

            customColor = document.getElementById("color_picker").value
            colorPath(start.x,start.y,path,customColor)
        }
        else
        {
            console.log("no path from",start.x,start.y,"to",end.x,end.y)
        }
    }
}

function Point(x,y)
{
    this.x = x
    this.y = y
    this.open = Math.random() > block_rate

    this.neighbors = function ()
    {
        if (x < 0 || y < 0 || x >= size || y >= size ) return []

        neighbors = new Array()
        
        if (x != 0) neighbors.push(maze[y][x-1])
        if (y != 0) neighbors.push(maze[y-1][x])
        if (x != size - 1) neighbors.push(maze[y][x+1])
        if (y != size - 1) neighbors.push(maze[y+1][x])
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

    selected = []
    display()
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
    cells[center][center].setAttribute("bgcolor",starColor)
}

function update_block_rate()
{
    slider = document.getElementById("block_rate_input")
    block_rate =  slider.value
    document.getElementById('block_rate_label').innerHTML = String(block_rate)+'\t' 
}

function shortestPathFrom(x,y)
{
    if (x < 0 || x >= size || y < 0 || y >= size || !maze[y][x].open)
    {
        console.error("invalid start point")
    }

    seen = []
    
    pq = [maze[y][x]]
    dist = new Array(size)
    for (var i = 0; i < size; i++) {
        dist[i] = new Array(size)
        for (var j = 0; j < size; j++)
        {
            dist[i][j] = unreachable
        }
    }
    dist[y][x] = 0;

    while(pq.length)
    {
        curr = pq.pop()
        seen.push(curr)
        
        curr.neighbors().forEach(n => {
            if (n.open)
            {
                dist[n.y][n.x] = Math.min(dist[n.y][n.x],dist[curr.y][curr.x]+1)
                if (seen.indexOf(n) == -1 && pq.indexOf(n) == -1)
                {
                    pq.push(n)
                }
            }
        });

        pq.sort((b,a) => dist[a.y][a.x]-dist[b.y][b.x])
    }

    return dist
}

function colorPath(x,y,dist,color)
{
    p = maze[y][x]
    while (dist[p.y][p.x] != unreachable && dist[p.y][p.x])
    {
        cells[p.y][p.x].setAttribute("bgcolor",color)
        p = p.neighbors()
            .sort((a,b) => dist[b.y][b.x]-dist[a.y][a.x])
            .pop()
    }
    cells[p.y][p.x].setAttribute("bgcolor",color)
}

function validMaze()
{
    c = shortestPathFrom(center,center)
    TL = c[0][0] < unreachable
    TR = c[0][size-1] < unreachable
    BL = c[size-1][0] < unreachable
    BR = c[size-1][size-1] < unreachable

    maze[center][center].open = false
    a = shortestPathFrom(0,0)
    maze[center][center].open = true
    CC = a[size - 1][size - 1] < unreachable
    
    valid = TL && BL && TR && BR && CC

    document.getElementById("valid_maze_label").innerHTML = valid

    return valid
}

function colorValid()
{
    c = shortestPathFrom(center,center)
    a = shortestPathFrom(0,0)
    
    colorPath(0,0,c,"orange")
    colorPath(size - 1,0,c,"green")
    colorPath(0,size - 1,c,"cyan")
    colorPath(size - 1,size - 1,c,"magenta")
    colorPath(size - 1,size - 1,a,"light-blue")
}

function getPath(x,y,dist)
{
    if (dist[y][x] == unreachable)
    {
        return []
    }
    path = []
    p = maze[y][x]
    while (dist[p.y][p.x] != unreachable && dist[p.y][p.x])
    {
        path.push(p)
        p = p.neighbors()
            .sort((a,b) => dist[b.y][b.x]-dist[a.y][a.x])
            .pop()
    }
    return path
}

function setFire(x,y)
{

}