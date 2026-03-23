class CONSIA_ENGINE {
  constructor(api, key){
    this.api = api;
    this.key = key;
  }

  async run(cmd){
    const c = String(cmd || "").toLowerCase();

    if(c.includes("resumen") || c.includes("summary")) return this.get("/v1/platform/global/summary");
    if(c.includes("ingresos") || c.includes("revenue")) return this.get("/v1/platform/global/revenue");
    if(c.includes("grants")) return this.get("/v1/owner/grants");
    if(c.includes("audit")) return this.get("/v1/audit/logs");
    if(c.includes("backup")) return this.get("/v1/backup/export");
    if(c.includes("sincronizar") || c.includes("comp sync")) return this.post("/v1/owner/comp/sync",{});
    if(c.includes("crear tenant")) return this.post("/v1/tenant/create",{ key:"auto_"+Date.now(), name:"auto_"+Date.now(), brand_name:"auto_"+Date.now() });

    return { ok:false, error:"command_not_recognized", command:cmd };
  }

  async get(url){
    const res = await fetch(this.api + url, {
      headers:{ "X-Owner-Key": this.key }
    });
    return await res.json();
  }

  async post(url, body={}){
    const res = await fetch(this.api + url, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Owner-Key": this.key
      },
      body: JSON.stringify(body)
    });
    return await res.json();
  }
}

window.CONSIA_ENGINE = CONSIA_ENGINE;
