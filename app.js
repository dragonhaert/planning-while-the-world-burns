const size = 51
const center = Math.floor(size/2)
const unreachable = size**2+1
var block_rate = 0.3

const table = document.getElementById("grid")
const maze = new Array(size)
const cells = new Array(size)

const wallColor = "401500"
const openColor = "FFFF80"
const starColor = "gold"
const fireColor = "red"

var selected = []
var time = 0
var fireField = []
var flammability = 0.2
var iterations = 1

const agent1 = {
    playing: true,
    x: 0,
    y: 0,
    path: [],
    color: "blue"
}

const agent2 = {
    playing: true,
    x: 0,
    y: 0,
    path: [],
    color:"orange",
    foresight: 0
}

const agent3 = {
    playing: true,
    x: 0,
    y: 0,
    path: [],
    color:"green",
    foresight: 3
}

const agent4 = {
    playing:true,
    x: 0,
    y: 0,
    path: [],
    color:"purple",
    foresight: 0
}

const dest = {
    x:50,
    y:50
}

var result = {
    concluded: false,
    agent1Escaped:false,
    agent1distance:unreachable,
    agent2Escaped:false,
    agent2distance:unreachable,
    agent3Escaped:false,
    agent3distance:unreachable,
    agent4Escaped:false,
    agent4distance:unreachable
}


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
    maze.forEach(row =>{
        row.forEach(p => {
            p.seed()
        })
    })
    
    clearAll()
    validMaze()
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
    cells[agent1.y][agent1.x].setAttribute("bgcolor",starColor)
    cells[agent2.y][agent2.x].setAttribute("bgcolor",starColor)
    cells[agent3.y][agent3.x].setAttribute("bgcolor",starColor)
    cells[agent4.y][agent4.x].setAttribute("bgcolor",starColor)
    
    agent1.color = document.getElementById("color1").value
    agent2.color = document.getElementById("color2").value
    agent3.color = document.getElementById("color3").value
    agent4.color = document.getElementById("color4").value
}

function resetAgents()
{
    initialShortestPaths = shortestPathFrom(dest.x,dest.y)

    agent1.x = 0
    agent1.y = 0
    agent1.playing = true
    agent1.path = getPath(agent1.x,agent1.y,initialShortestPaths)
    
    agent2.x = 0
    agent2.y = 0
    agent2.foresight = 0
    agent2.playing = true
    agent2.path = getPath(agent2.x,agent2.y,initialShortestPaths)

    agent3.x = 0
    agent3.y = 0
    agent3.playing = true
    agent3.path = getPath(agent3.x,agent3.y,initialShortestPaths)
    
    agent4.x = 0
    agent4.y = 0
    agent4.playing = true
    agent4.path = getPath(agent4.x,agent4.y,initialShortestPaths)
    agent4.foresight = agent4.path.length/2
}

function clearAll(){
    maze.forEach(row =>{
        row.forEach(c => {
            c.onFire = false
        })
    })
    
    
    maze[0][0].open = true
    maze[0][size-1].open = true
    maze[size-1][0].open = true
    maze[size-1][size-1].open = true
    maze[center][center].open = true
    maze[center][center].onFire = true
    fireField = [maze[center][center]]
    selected = []


    time = 0

    resetAgents()
    result = {
        concluded: false,
        agent1Escaped:false,
        agent1distance:unreachable,
        agent2Escaped:false,
        agent2distance:unreachable,
        agent3Escaped:false,
        agent3distance:unreachable,
        agent4Escaped:false,
        agent4distance:unreachable
    }

    display()
}

function update_block_rate()
{
    input = document.getElementById("block_rate_input")
    block_rate =  input.value
    //document.getElementById('block_rate_label').innerHTML = String(block_rate)+'\t' 
}

function update_flammability()
{
    input = document.getElementById("flammability_input")
    flammability = input.value
    //document.getElementById('flammability_label').innerHTML = String(flammability)+'\t'
}

function update_iterations()
{
    input = document.getElementById("iteration_input")
    iterations = input.value
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

function colorPathFromDist(x,y,dist,color)
{
    path = getPath(x,y,dist)
    colorPath(path, color)
}

function colorPath(path, color)
{
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

        dist = shortestPathFrom(end.x,end.y,maze,true)

        if (dist[start.y][start.x] != unreachable)
        {
            console.log("path found from",start.x,start.y,"to",end.x,end.y)

            customColor = document.getElementById("color_picker").value
            colorPathFromDist(start.x,start.y,dist,customColor)
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

    document.getElementById("valid_maze_label").innerHTML = valid ? "Valid" : "Invalid"

    return valid
}

function colorValid()
{
    c = shortestPathFrom(center,center)
    a = shortestPathFrom(0,0)
    
    colorPathFromDist(0,0,c,"#e94971")
    colorPathFromDist(size - 1,0,c,"#e9ae49")
    colorPathFromDist(0,size - 1,c,"#7e49e9")
    colorPathFromDist(size - 1,size - 1,c,"#b4e949")
    colorPathFromDist(size - 1,size - 1,a,"#49e994")
}

function getPath(x,y,dist,state=maze)
{
    if (dist[y][x] == unreachable || dist[y][x] == 0)
    {
        return []
    }
    p = state[y][x]
    path = [p]
    while (dist[p.y][p.x] != unreachable/* && dist[p.y][p.x]*/)
    {
        p = p.neighbors().sort((a,b) => dist[b.y][b.x]-dist[a.y][a.x]).pop()

        path.push(p)
        if (!dist[p.y][p.x])
        {
            path.shift()
            return path
        }
    }   
}

function generateValidMaze()
{
    generate()
    tries = 0
    limit = 999
    while(!validMaze() && tries < limit)
    {
        tries++
        generate()
    }
    return tries != limit

}

function spreadFire(fire=fireField,state=maze)
{
    stage = fire.filter(spark => spark.neighbors(state).some(n => n.open && !n.onFire))
    toLight = []
    stage.forEach(edge => {
        edge.neighbors(state)
        .filter(n => n.open && !n.onFire)
        .forEach(fringe => {
            if (toLight.indexOf(fringe) == -1)
            {
                burningNeighbors = fringe.neighbors(state).filter(n => n.onFire).length
                threshold = 1 - (1 - flammability)**burningNeighbors
                if (Math.random() < threshold) 
                {
                    toLight.push(fringe)
                }
            }
        })
    });

    toLight.forEach(kindle => {
        kindle.onFire = true;
        fire.push(kindle)
    })
}

function replan(agent)
{
    
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

    for (var i = 0; i < agent.foresight; i++)
    {
        spreadFire(projectedFire,projectedState)
    }
    
    a = shortestPathFrom(dest.x,dest.y,projectedState,true)

    newpath = getPath(agent.x,agent.y,a,projectedState)
    return newpath
}


function simulationStep()
{
    //this only applies to manual stepping. a full simulation will end before the next iteration 
    if (!agent1.playing && !agent2.playing && !agent3.playing && !agent4.playing)
    {
        console.log("simulation completed",result)
        return
    }
    
    spreadFire()
    time++
    
    
    if (agent1.playing && agent1.path.length)
    {
        next = agent1.path.shift()
        agent1.x = next.x
        agent1.y = next.y

        if (!agent1.path.length || maze[agent1.y][agent1.x].onFire)
        {
            agent1.playing = false
            result.agent1Escaped = !maze[agent1.y][agent1.x].onFire
            result.agent1distance = agent1.path.length
        }
    }

    if (agent2.playing && agent2.path.length)
    { 
        newplan = replan(agent2)
        if (newplan.length)
        {
            agent2.path = newplan
        }
        
        next = agent2.path.shift()
        agent2.x = next.x
        agent2.y = next.y


        if (!agent2.path.length || maze[agent2.y][agent2.x].onFire)
        {
            agent2.playing = false
            result.agent2Escaped = !maze[agent2.y][agent2.x].onFire
            result.agent2distance = agent2.path.length
        }
    }

    if (agent3.playing && agent3.path.length)
    { 
        newplan = replan(agent3)
        if (newplan.length)
        {
            agent3.path = newplan
        }
        next = agent3.path.shift()
        agent3.x = next.x
        agent3.y = next.y

        if (!agent3.path.length || maze[agent3.y][agent3.x].onFire)
        {
            agent3.playing = false
            result.agent3Escaped = !maze[agent3.y][agent3.x].onFire
            result.agent3distance = agent3.path.length
        }
    }
    
    if (agent4.playing && agent4.path.length)
    {
        if (agent4.path.length%time)
        {
            agent4.foresight = agent4.path.length/2
            newplan = replan(agent4)
            if (newplan.length)
            {
                agent4.path = newplan
            }
        }
        next = agent4.path.shift()
        agent4.x = next.x
        agent4.y = next.y


        if (!agent4.path.length || maze[agent4.y][agent4.x].onFire)
        {
            agent4.playing = false
            result.agent4Escaped = !maze[agent4.y][agent4.x].onFire
            result.agent4distance = agent4.path.length
        }
    }

    display()
    colorPath(agent1.path,agent1.color)
    colorPath(agent2.path,agent2.color)
    colorPath(agent3.path,agent3.color)
    colorPath(agent4.path,agent4.color)
}

function fullSimulation(repeat=iterations)
{
    aggregate = {
        allFail:0,
        allSurvive:0,
        agent1Survives:0,
        agent2Survives:0,
        agent3Survives:0,
        agent4Survives:0,
        omitted: 0
    }
    for (var i = 0; i < repeat; i++)
    {
        if (!generateValidMaze())
        {
            aggregate.omitted++
            continue;
        }

        while (!(result.concluded = !agent1.playing && !agent2.playing && !agent3.playing && !agent4.playing))
        {
            simulationStep()
        }
        if (result.agent1Escaped && result.agent2Escaped && result.agent3Escaped && result.agent4Escaped)
        {
            aggregate.allSurvive++
        }
        else if (!result.agent1Escaped && !result.agent2Escaped && !result.agent3Escaped && !result.agent4Escaped)
        {
            aggregate.allFail++
        }
        else
        {
            if (result.agent1Escaped)
            {
                aggregate.agent1Survives++
            }
            if (result.agent2Escaped)
            {
                aggregate.agent2Survives++
            }
            if (result.agent3Escaped)
            {
                aggregate.agent3Survives++
            }
            if (result.agent4Escaped)
            {
                aggregate.agent4Survives++
            }
        }
    }

    document.querySelectorAll('.results').forEach(row => row.style.setProperty("display","block"))
    document.getElementById("agent1successrate").innerHTML = aggregate.agent1Survives / repeat
    document.getElementById("agent2successrate").innerHTML = aggregate.agent2Survives / repeat
    document.getElementById("agent3successrate").innerHTML = aggregate.agent3Survives / repeat
    document.getElementById("agent4successrate").innerHTML = aggregate.agent4Survives / repeat

    console.log(aggregate)
}