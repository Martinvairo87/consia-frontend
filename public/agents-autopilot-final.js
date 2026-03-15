/* ======================================================
CONSIA GLOBAL AGENT SWARM ENGINE
Top 1 Autonomous Agent System
====================================================== /

const CONSIA_SWARM = {

agents: [

{
name:"research_agent",
role:"research",
status:"ready"
},

{
name:"analysis_agent",
role:"analysis",
status:"ready"
},

{
name:"strategy_agent",
role:"strategy",
status:"ready"
},

{
name:"execution_agent",
role:"execution",
status:"ready"
},

{
name:"business_agent",
role:"business",
status:"ready"
},

{
name:"marketing_agent",
role:"marketing",
status:"ready"
},

{
name:"finance_agent",
role:"finance",
status:"ready"
},

{
name:"legal_agent",
role:"legal",
status:"ready"
},

{
name:"automation_agent",
role:"automation",
status:"ready"
},

{
name:"memory_agent",
role:"memory",
status:"ready"
}

],

state:"idle",
tasks:[],
results:[]

}

/ ======================================================
SYSTEM STATUS
====================================================== /

function swarmStatus(){

return {
agents:CONSIA_SWARM.agents.length,
state:CONSIA_SWARM.state,
tasks:CONSIA_SWARM.tasks.length
}

}

/ ======================================================
TASK ROUTER
====================================================== /

function routeTask(goal){

const lower = goal.toLowerCase()

if(lower.includes("negocio") || lower.includes("business"))
return ["research_agent","analysis_agent","strategy_agent","business_agent"]

if(lower.includes("marketing"))
return ["research_agent","marketing_agent","strategy_agent"]

if(lower.includes("codigo") || lower.includes("software"))
return ["analysis_agent","execution_agent","automation_agent"]

return ["analysis_agent","strategy_agent","execution_agent"]

}

/ ======================================================
AUTOPILOT ENGINE
====================================================== /

async function runAutopilot(mode,goal){

CONSIA_SWARM.state="running"

const assignedAgents = routeTask(goal)

const result = {
mode,
goal,
agents:assignedAgents,
steps:[],
time:new Date().toISOString()
}

assignedAgents.forEach(a=>{

result.steps.push({
agent:a,
status:"completed"
})

})

CONSIA_SWARM.results.push(result)

CONSIA_SWARM.state="completed"

return result

}

/ ======================================================
COMMAND EXECUTION
====================================================== /

async function executeCommand(goal){

const res = await fetch("https://api.consia.world/v1/chat",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message:goal
})

})

return await res.json()

}

/ ======================================================
AUTOPILOT API
====================================================== /

async function autopilotAPI(mode,goal){

try{

const plan = await runAutopilot(mode,goal)

return {
ok:true,
swarm:swarmStatus(),
plan
}

}catch(e){

return {
ok:false,
error:String(e)
}

}

}

/ ======================================================
SWARM MONITOR
====================================================== /

function swarmMonitor(){

return {
state:CONSIA_SWARM.state,
agents:CONSIA_SWARM.agents,
tasks:CONSIA_SWARM.tasks,
results:CONSIA_SWARM.results
}

}

/ ======================================================
LIVE UPDATE LOOP
====================================================== /

setInterval(()=>{

const agentsCard = document.querySelector("#agents")

if(agentsCard){

agentsCard.innerText = CONSIA_SWARM.agents.length

}

},2000)

/ ======================================================
GLOBAL EXPORT
====================================================== */

window.CONSIA_SWARM = CONSIA_SWARM
window.autopilotAPI = autopilotAPI
window.executeCommand = executeCommand
window.swarmMonitor = swarmMonitor

console.log("CONSIA AGENT SWARM ACTIVE")
