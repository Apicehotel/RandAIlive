import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state={error:null}
  }
  static getDerivedStateFromError(error){
    return {error}
  }
  componentDidCatch(error,info){
    console.error('RandAILive render error',error,info)
  }
  render(){
    if(this.state.error){
      return <main style={{minHeight:'100vh',background:'#050a12',color:'#e7f4ff',padding:'24px',fontFamily:'ui-monospace,monospace'}}>
        <h1 style={{marginTop:0}}>RandAILive</h1>
        <p>Errore di avvio dell'interfaccia.</p>
        <pre style={{whiteSpace:'pre-wrap',padding:'12px',border:'1px solid #8b2b36',background:'#2a0d13',color:'#ffb3bd',borderRadius:'8px'}}>
          {String(this.state.error?.message||this.state.error)}
        </pre>
      </main>
    }
    return this.props.children
  }
}
