const size = 51
const center = Math.floor(size/2)
const unreachable = size**2+1
var block_rate = 0.3

const wallColor = "401500"
const openColor = "FFFF80"
const starColor = "gold"
const fireColor = "red"


const table = document.getElementById("grid")
const maze = new Array(size)
const cells = new Array(size)

var fireField = []
var flammability = 0.5

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
        cells[i][j].setAttribute("class","maze")
        cells[i][j].setAttribute("onclick","select(event)")
    }
}

generate()
display()



function Point(x,y)
{
    this.x = x
    this.y = y
    this.open = Math.random() > block_rate
    this.onFire = false

    this.neighbors = function (state = maze)
    {
        if (x < 0 || y < 0 || x >= size || y >= size ) return []

        neighbors = new Array()
        
        if (x != 0) neighbors.push(state[y][x-1])
        if (y != 0) neighbors.push(state[y-1][x])
        if (x != size - 1) neighbors.push(state[y][x+1])
        if (y != size - 1) neighbors.push(state[y+1][x])
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
            maze[i][j].onFire = false
        }
    }
    maze[0][0].open = true
    maze[0][size-1].open = true
    maze[size-1][0].open = true
    maze[size-1][size-1].open = true
    maze[center][center].open = true
    maze[center][center].onFire = true

    fireField = [maze[center][center]]
    selected = []
    
    validMaze()
    display()
}

function display(state=maze)
{
    for (var i = 0; i < size; i++)
    {
        for (var j = 0; j < size; j++)
        {
            cells[i][j].setAttribute("bgcolor", state[i][j].open ? (state[i][j].onFire ? fireColor : openColor) : wallColor)
        }
    }
    cells[center][center].setAttribute("bgcolor",starColor)
}

function clearAll(){
    maze.forEach(row =>{
        row.forEach(c => {
            c.onFire = false
        })
    })
    maze[center][center].onFire = true
    fireField = [maze[center][center]]
    selected = []
    display()
}

function update_block_rate()
{
    slider = document.getElementById("block_rate_input")
    block_rate =  slider.value
    document.getElementById('block_rate_label').innerHTML = String(block_rate)+'\t' 
}

function update_flammability()
{
    slider = document.getElementById("fire_spread_rate")
    flammability = slider.value
}

function shortestPathFrom(x,y,state=maze,avoidFire=false)
{
    if (x < 0 || x >= size || y < 0 || y >= size)
    {
        console.error("invalid start point")
    }

    seen = []
    
    pq = [state[y][x]]
    dist = new Array(size)
    for (var i = 0; i < size; i++) {
        dist[i] = new Array(size)
        for (var j = 0; j < size; j++)
        {
            dist[i][j] = unreachable
        }
    }
    if (!state[y][x].open || (avoidFire && state[y][x].onFire))
    {
        return dist
    }
    dist[y][x] = 0;

    while(pq.length)
    {
        curr = pq.pop()
        seen.push(curr)
        
        curr.neighbors().forEach(n => {
            if (n.open && (!avoidFire || !state[n.y][n.x].onFire))
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
    path = getPath(x,y,dist)
    path.forEach(p => {
        cells[p.y][p.x].setAttribute("bgcolor",color)
    })
}

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

        path = shortestPathFrom(end.x,end.y,maze,true)

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
    
    colorPath(0,0,c,"#e94971")
    colorPath(size - 1,0,c,"#e9ae49")
    colorPath(0,size - 1,c,"#7e49e9")
    colorPath(size - 1,size - 1,c,"#b4e949")
    colorPath(size - 1,size - 1,a,"#49e994")
}

function getPath(x,y,dist,state=maze)
{
    if (dist[y][x] == unreachable)
    {
        return []
    }
    path = []
    p = state[y][x]
    while (dist[p.y][p.x] != unreachable && dist[p.y][p.x])
    {
        path.push(p)
        p = p.neighbors()
            .sort((a,b) => dist[b.y][b.x]-dist[a.y][a.x])
            .pop()
    }
    return path
}

function generateValidMaze()
{
    generate()
    tries = 0
    limit = 9999
    while(!validMaze() && tries < limit)
    {
        tries++
        generate()
    }
    return tries != limit

}

function pathOnFire(path)
{
    path.forEach(point => {
        if (point.onFire)
        {
            return true
        }
    });
    return false
}

function spreadFire()
{
    stage = fireField.filter(spark => spark.neighbors().filter(n => n.open && !n.onFire).length)
    toLight = []
    safe = []
    stage.forEach(edge => {
        edge.neighbors()
        .filter(n => n.open && !n.onFire && toLight.indexOf(n) == -1)
        .forEach(fringe => {
            burningNeighbors = fringe.neighbors().filter(n => n.onFire).length
            threshold = 1 - (1 - flammability)**burningNeighbors
            if (Math.random() < threshold) 
            {
                toLight.push(fringe)
            }
            else
            {
                safe.push(fringe)
            }
        })
    });

    toLight.forEach(kindle => {
        kindle.onFire = true;
        fireField.push(kindle)
        cells[kindle.y][kindle.x].setAttribute("bgcolor",fireColor)
    })
}

function agent3(x=0,y=0,dx=size-1,dy=size-1)
{
    function projectSpread(fire,state)
    {
        stage = projectedFire.filter(spark => spark.neighbors(state).filter(n => n.open && !n.onFire).length)
        toLight = []
        safe = []
        stage.forEach(edge => {
            edge.neighbors(state)
            .filter(n => n.open && !n.onFire && toLight.indexOf(n) == -1)
            .forEach(fringe => {
                burningNeighbors = fringe.neighbors(state).filter(n => n.onFire).length
                threshold = 1 - (1 - flammability)**burningNeighbors
                if (Math.random() < threshold) 
                {
                    toLight.push(fringe)
                }
                else
                {
                    safe.push(fringe)
                }
            })
        });

        toLight.forEach(kindle => {
            kindle.onFire = true;
            fire.push(kindle)
            cells[kindle.y][kindle.x].setAttribute("bgcolor",fireColor)
        })
    }
    projectedState = new Array(size)
    projectedFire = []

    for (var i = 0; i < size; i++) {
        projectedState[i] = new Array(size)
        for (var j = 0; j < size; j++)
        {
            ref = maze[i][j]
            projectedState[i][j] = new Point(ref.x,ref.y)
            projectedState[i][j].open = ref.open
            if (ref.onFire)
            {
                projectedState[i][j].onFire = true
                projectedFire.push(projectedState[i][j])
            }
        }
    }

    projectSpread(projectedFire,projectedState)
    projectSpread(projectedFire,projectedState)
    projectSpread(projectedFire,projectedState)
    
    a = shortestPathFrom(dx,dy,projectedState,true)

    display()
    colorPath(0,0,a,"blue")
    return getPath(x,y,a,projectedState)
}