// Dependency-free Supabase transport. Every retry keeps the original command ID.
export class RealmClient {
  constructor({url,key,storage=globalThis.localStorage,fetcher=globalThis.fetch,clock=Date.now}) {
    this.url=url;this.key=key;this.storage=storage;this.fetcher=fetcher;this.clock=clock;this.refreshing=null;
    this.session=this.read('azeroth-session');this.pending=this.read('azeroth-pending');this.offset=0;
    if(this.pending?.owner!==this.session?.user?.id)this.pending=null;
  }
  read(key){try{return JSON.parse(this.storage.getItem(key)||'null');}catch{return null;}}
  saveSession(data){this.session={...data,expires_at:this.clock()+data.expires_in*1000};this.storage.setItem('azeroth-session',JSON.stringify(this.session));}
  async transport(path,body,auth=true){
    if(auth&&!this.session)throw Error('Necesitas entrar con tu cuenta.');
    if(auth&&this.session.expires_at<this.clock()+30000){
      if(!this.refreshing)this.refreshing=this.transport('/auth/v1/token?grant_type=refresh_token',{refresh_token:this.session.refresh_token},false).then(d=>this.saveSession(d)).finally(()=>{this.refreshing=null;});
      await this.refreshing;
    }
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await this.fetcher(this.url+path,{method:'POST',headers:{apikey:this.key,'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+this.session.access_token}:{})},body:JSON.stringify(body),signal:controller.signal});
      let data;try{data=await response.json();}catch{const e=Error('Respuesta de conexión incompleta. Reintenta la misma acción.');e.retryable=true;throw e;}
      if(!response.ok){const e=Error(data.message||data.msg||data.error_description||'No se ha podido conectar.');e.retryable=response.status>=500||response.status===429;throw e;}
      if(typeof data.server_time==='number')this.offset=data.server_time-this.clock();
      return data;
    }catch(error){if(error.name==='AbortError'||error instanceof TypeError){const e=Error('La conexión se ha interrumpido. Puedes reintentar la misma acción con seguridad.');e.retryable=true;throw e;}throw error;}
    finally{clearTimeout(timer);}
  }
  async signIn(email,password,signup=false){const data=await this.transport(signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{email,password},false);if(data.access_token)this.saveSession(data);return data;}
  async signOut(){try{if(this.session)await this.transport('/auth/v1/logout',{});}finally{this.session=null;this.pending=null;this.storage.removeItem('azeroth-session');this.storage.removeItem('azeroth-pending');}}
  async command(action,arg=null){
    if(['get','refresh'].includes(action))return this.transport('/rest/v1/rpc/realm_command',{action,arg,request_id:null});
    if(!this.session)throw Error('Necesitas entrar con tu cuenta.');
    if(this.pending&&(this.pending.action!==action||JSON.stringify(this.pending.arg)!==JSON.stringify(arg)))throw Error('Primero comprueba la acción que quedó pendiente de conexión.');
    const command=this.pending||{action,arg,request_id:globalThis.crypto.randomUUID(),owner:this.session.user.id};
    this.pending=command;this.storage.setItem('azeroth-pending',JSON.stringify(command));
    for(let attempt=0;attempt<2;attempt++){
      try{
        const result=await this.transport('/rest/v1/rpc/realm_command',{action:command.action,arg:command.arg,request_id:command.request_id});
        this.pending=null;this.storage.removeItem('azeroth-pending');return result;
      }catch(error){
        if(error.retryable){if(attempt===0)continue;throw error;}
        this.pending=null;this.storage.removeItem('azeroth-pending');throw error;
      }
    }
  }
  retry(){if(!this.pending)throw Error('No hay acciones pendientes.');return this.command(this.pending.action,this.pending.arg);}
}
