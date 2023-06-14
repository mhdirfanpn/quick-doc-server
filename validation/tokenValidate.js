export const token =(val)=>{
    const map =new Map();
    if(map.size===0){ map.set('token',val); return }
    if(map.has(val)) return true
    return false
}

