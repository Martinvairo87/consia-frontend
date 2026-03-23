class ConsiaCommandEngine {
  constructor(apiUrl, ownerKey){
    this.apiUrl = apiUrl;
    this.ownerKey = ownerKey;
  }

  async run(command){
    const c = command.toLowerCase();

    // -------- DASHBOARD --------
    if(c.includes("resumen") || c.includes("estado")){
      return this.call("/v1/platform/global/summary");
    }

    if(c.includes("ingresos") || c.includes("revenue")){
      return this.call("/v1/platform/global/revenue");
    }

    // -------- TENANTS --------
    if(c.includes("crear tenant")){
      return this.call("/v1/tenant/create", {
        key: "nuevo_" + Date.now()
      });
    }

    if(c.includes("activar plan")){
      return this.call("/v1/tenant/plan/update", {
        tenant: "manglar",
        plan_key: "enterprise"
      });
    }

    // -------- OWNER --------
    if(c.includes("sincronizar") || c.includes("owner")){
      return this.call("/v1/owner/comp/sync", {});
    }

    // -------- BACKUP --------
    if(c.includes("backup")){
      return this.call("/v1/backup/export");
    }

    return {
      ok:false,
      message:"Comando no reconocido"
    };
  }

  async call(endpoint, body={}){
    const res = await fetch(this.apiUrl + endpoint,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Owner-Key": this.ownerKey
      },
      body: JSON.stringify(body)
    });

    return await res.json();
  }
}

window.CONSIA_ENGINE = ConsiaCommandEngine;
