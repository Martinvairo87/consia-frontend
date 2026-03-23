class CONSIA_ENGINE {
  constructor(api, key){
    this.api = api;
    this.key = key;
  }

  async run(cmd){
    const c = cmd.toLowerCase();

    if(c.includes("resumen")) return this.call("/v1/platform/global/summary");
    if(c.includes("ingresos")) return this.call("/v1/platform/global/revenue");
    if(c.includes("crear tenant")) return this.call("/v1/tenant/create",{ key:"auto_"+Date.now() });
    if(c.includes("sincronizar")) return this.call("/v1/owner/comp/sync",{});

    return {ok:false};
  }

  async call(url,body={}){
    const res = await fetch(this.api+url,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Owner-Key":this.key
      },
      body:JSON.stringify(body)
    });
    return await res.json();
  }
}

window.CONSIA_ENGINE = CONSIA_ENGINE;
