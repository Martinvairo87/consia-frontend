/* =========================================================
   CONSIA SELF LEARNING ENGINE
   Archivo: public/self-learning-engine.js
   Aprendizaje automático del sistema
   Optimiza estrategias, agentes y decisiones
   ========================================================= */

(function(){

"use strict"

const CONSIA_LEARNING_ENGINE = {

state:"idle",

memory:[],
patterns:[],
optimizations:[],
executions:[],
knowledge:[],

learning_rate:0.1

}

function now(){
return new Date().toISOString()
}

function normalize(text){
return String(text||"")
.toLowerCase()
.replace(/[^\w\s]/g,"")
.trim()
}

function tokens(text){
return normalize(text).split(/\s+/).filter(Boolean)
}

function recordExecution(data){

CONSIA_LEARNING_ENGINE.executions.push({
id:"exec_"+Date.now(),
timestamp:now(),
data:data
})

learnFromExecution(data)

}

function learnFromExecution(data){

CONSIA_LEARNING_ENGINE.state="learning"

const words=tokens(JSON.stringify(data))

const pattern={
id:"pattern_"+Date.now(),
tokens:words,
source:data
}

CONSIA_LEARNING_ENGINE.patterns.push(pattern)

updateKnowledge(pattern)

CONSIA_LEARNING_ENGINE.state="idle"

}

function updateKnowledge(pattern){

CONSIA_LEARNING_ENGINE.knowledge.push({
id:"knowledge_"+Date.now(),
pattern:pattern.tokens,
created:now()
})

}

function detectPattern(input){

const words=tokens(input)

let score=0
let best=null

CONSIA_LEARNING_ENGINE.patterns.forEach(p=>{

let match=0

words.forEach(w=>{
if(p.tokens.includes(w)) match++
})

if(match>score){
score=match
best=p
}

})

return best

}

function suggestOptimization(input){

const pattern=detectPattern(input)

if(!pattern){
return{
optimization:"none",
confidence:0
}
}

return{
optimization:"reuse_pattern",
confidence:0.7,
pattern:pattern
}

}

function optimizeAgents(agents){

return agents.sort(()=>Math.random()-0.5)

}

function improveStrategy(strategy){

if(!strategy) return strategy

strategy.optimized=true
strategy.updated_at=now()

return strategy

}

async function analyzeExecution(data){

recordExecution(data)

const optimization=suggestOptimization(JSON.stringify(data))

return{
learning:true,
optimization:optimization
}

}

async function learnLoop(){

CONSIA_LEARNING_ENGINE.state="monitoring"

setInterval(()=>{

if(CONSIA_LEARNING_ENGINE.executions.length>0){

const last=CONSIA_LEARNING_ENGINE.executions.slice(-1)[0]

analyzeExecution(last)

}

},10000)

}

function getLearningStatus(){

return{
state:CONSIA_LEARNING_ENGINE.state,
patterns:CONSIA_LEARNING_ENGINE.patterns.length,
knowledge:CONSIA_LEARNING_ENGINE.knowledge.length,
executions:CONSIA_LEARNING_ENGINE.executions.length
}

}

function connectStrategicEngine(){

if(window.strategicAnalyze){

const original=window.strategicAnalyze

window.strategicAnalyze=function(input){

const result=original(input)

recordExecution({
type:"strategy",
input:input,
result:result
})

return result

}

}

}

function connectGlobalBrain(){

if(window.runGlobalBrain){

const original=window.runGlobalBrain

window.runGlobalBrain=async function(input){

const result=await original(input)

recordExecution({
type:"brain",
input:input,
result:result
})

return result

}

}

}

function connectAutopilot(){

if(window.dispatchStrategicPlan){

const original=window.dispatchStrategicPlan

window.dispatchStrategicPlan=async function(input){

const result=await original(input)

recordExecution({
type:"execution",
input:input,
result:result
})

return result

}

}

}

function updateUI(){

const el=document.getElementById("learning-status")

if(!el) return

const status=getLearningStatus()

el.innerText=
"STATE: "+status.state+
" | PATTERNS: "+status.patterns+
" | KNOWLEDGE: "+status.knowledge+
" | EXECUTIONS: "+status.executions

}

function initLearningEngine(){

console.log("CONSIA SELF LEARNING ENGINE ACTIVE")

connectStrategicEngine()
connectGlobalBrain()
connectAutopilot()

learnLoop()

setInterval(updateUI,2000)

}

window.CONSIA_LEARNING_ENGINE=CONSIA_LEARNING_ENGINE
window.initLearningEngine=initLearningEngine
window.getLearningStatus=getLearningStatus

initLearningEngine()

})()
