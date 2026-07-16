export function userStorageKey(userId,key){
  if(!userId) throw new Error('userId é obrigatório para armazenamento multiusuário');
  return `nutriclock:${userId}:${key}`;
}

export function readUserStorage(userId,key,fallback){
  if(typeof window==='undefined') return fallback;
  try{
    const raw=localStorage.getItem(userStorageKey(userId,key));
    return raw===null?fallback:JSON.parse(raw);
  }catch{return fallback;}
}

export function writeUserStorage(userId,key,value){
  if(typeof window==='undefined') return;
  localStorage.setItem(userStorageKey(userId,key),JSON.stringify(value));
}
