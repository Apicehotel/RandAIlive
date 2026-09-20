import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

export function useMaintainerAuth(){
  const [session,setSession]=useState(null)
  const [loading,setLoading]=useState(Boolean(supabase))
  useEffect(()=>{
    if(!supabase){setLoading(false);return undefined}
    let alive=true
    supabase.auth.getSession().then(({data})=>{if(alive){setSession(data.session);setLoading(false)}})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
    return()=>{alive=false;subscription.unsubscribe()}
  },[])
  return {session,user:session?.user||null,loading}
}

export async function signInMaintainer(email,password){
  if(!supabase) return {error:new Error('Supabase non configurato')}
  return supabase.auth.signInWithPassword({email,password})
}

export async function signOutMaintainer(){
  if(supabase) await supabase.auth.signOut()
}
