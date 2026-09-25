import { bakeHotel } from './hotel-bake-v3.js'
import { drawProps } from './hotel-props-v3.js'

export function createHotelRenderer(scene, projection){
  const baked=bakeHotel(scene,projection)
  const props=drawProps(scene,projection)

  const overlay=scene.add.graphics().setDepth(20)
  function drawAmbient(now=0){
    overlay.clear()
    // restrained vignette / warm-cool separation; no fake state, purely visual.
    overlay.fillStyle(0x061018,.08).fillRect(0,0,projection.world.width,projection.world.height)
    const pulse=(Math.sin(now/1800)+1)/2
    overlay.fillStyle(0x58dfff,.025+.012*pulse).fillCircle(776,637,160)
    overlay.fillStyle(0xffc36c,.025).fillCircle(655,420,250)
  }
  function dispose(){
    baked.base?.destroy()
    overlay.destroy()
    for(const p of props)p.graphics?.destroy()
  }
  return {drawAmbient,dispose,props,baked}
}
