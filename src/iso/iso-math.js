export const ISO_TILE_W=128
export const ISO_TILE_H=64
export const ISO_ORIGIN={x:960,y:120}

export function gridToScreen(gx,gy,z=0){
  return {
    x:ISO_ORIGIN.x+(gx-gy)*(ISO_TILE_W/2),
    y:ISO_ORIGIN.y+(gx+gy)*(ISO_TILE_H/2)-z,
  }
}

export function screenToGrid(sx,sy){
  const x=sx-ISO_ORIGIN.x
  const y=sy-ISO_ORIGIN.y
  return {
    gx:(x/(ISO_TILE_W/2)+y/(ISO_TILE_H/2))/2,
    gy:(y/(ISO_TILE_H/2)-x/(ISO_TILE_W/2))/2,
  }
}

export function isoDepth(gx,gy,z=0){return (gx+gy)*100+z}
