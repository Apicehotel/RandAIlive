export const ROOM_VISUALS = Object.freeze({
  reception:{material:'terrazzo',wall:'hotel',light:'warm',props:['receptionDesk','sofa','plant','luggage']},
  lobby:{material:'marble',wall:'hotel',light:'warm',props:['sofa','sofa','coffeeTable','plant','plant']},
  bar:{material:'parquet',wall:'wood',light:'amber',props:['barCounter','stool','stool','stool','bottleRack']},
  breakfast:{material:'parquet',wall:'hotel',light:'warm',props:['diningTable','diningTable','buffet','plant']},
  kitchen:{material:'tile',wall:'service',light:'white',props:['prepCounter','prepCounter','fridge','rack']},
  congress:{material:'carpet',wall:'hotel',light:'warm',props:['stage','conferenceRows','screen']},
  meeting:{material:'carpet',wall:'hotel',light:'warm',props:['meetingTable','screen','plant']},
  spa:{material:'stone',wall:'spa',light:'soft',props:['lounger','lounger','plant','plant']},
  gym:{material:'rubber',wall:'service',light:'white',props:['treadmill','treadmill','bench']},
  laundry:{material:'tile',wall:'service',light:'white',props:['washer','washer','linenRack']},
  ironing:{material:'tile',wall:'service',light:'white',props:['ironingTable','linenRack','linenRack']},
  warehouse:{material:'concrete',wall:'service',light:'white',props:['rack','rack','crate','crate']},
  technical:{material:'concrete',wall:'service',light:'white',props:['workbench','toolWall','rack']},
  staff:{material:'rubber',wall:'service',light:'white',props:['locker','locker','bench']},
  exterior:{material:'stone',wall:'exterior',light:'day',props:['car','planter','planter']},
  hub:{material:'tech',wall:'tech',light:'cyan',props:['coreConsole','terminal','terminal']},
})

export const FLOOR_VISUALS = Object.freeze({
  jazz:{material:'parquet',wall:'hotel',light:'warm',props:['bed','bed','nightstand','wardrobe','plant']},
  wine:{material:'parquet',wall:'wine',light:'warm',props:['bed','bed','nightstand','wardrobe','plant']},
})

export const MATERIALS = Object.freeze({
  terrazzo:{base:0xc9b18b,alt:0xb89b72,grout:0x8d765d},
  marble:{base:0xd8cab2,alt:0xc7b79c,grout:0x998c78},
  parquet:{base:0x8d6847,alt:0x765236,grout:0x4f3928},
  tile:{base:0xbcc6c3,alt:0xaeb9b6,grout:0x737e7b},
  carpet:{base:0x733a36,alt:0x65302f,grout:0x4d2524},
  stone:{base:0xa59c8b,alt:0x8f8778,grout:0x6e675b},
  rubber:{base:0x3b4248,alt:0x30363b,grout:0x20252a},
  concrete:{base:0x777a79,alt:0x686b6a,grout:0x4f5251},
  tech:{base:0x183648,alt:0x102b3a,grout:0x0a1d28},
})

const jazz=/^jazz[1-4]$/
const wine=/^wine[5-8]$/

export function visualForRoom(id){
  if(ROOM_VISUALS[id]) return ROOM_VISUALS[id]
  if(jazz.test(id)) return FLOOR_VISUALS.jazz
  if(wine.test(id)) return FLOOR_VISUALS.wine
  return {material:'terrazzo',wall:'hotel',light:'warm',props:['plant']}
}

export function propLayout(room){
  const visual=visualForRoom(room.name)
  const inset=18
  const usableW=Math.max(40,room.width-inset*2)
  const usableH=Math.max(40,room.height-70)
  return visual.props.map((type,index)=>{
    const cols=Math.max(2,Math.ceil(Math.sqrt(visual.props.length)))
    const rows=Math.ceil(visual.props.length/cols)
    const col=index%cols
    const row=Math.floor(index/cols)
    return {
      id:`${room.name}:${type}:${index}`,
      type,
      x:room.x+inset+(col+.5)*(usableW/cols),
      y:room.y+58+(row+.5)*(usableH/Math.max(1,rows)),
      roomId:room.name,
    }
  })
}

export function roomLight(room){
  const mode=visualForRoom(room.name).light
  const presets={
    warm:{color:0xffc96b,alpha:.11,radius:.46},
    amber:{color:0xffa64d,alpha:.14,radius:.48},
    white:{color:0xd8f3ff,alpha:.08,radius:.44},
    soft:{color:0xffe2ba,alpha:.09,radius:.5},
    cyan:{color:0x55dcff,alpha:.14,radius:.52},
    day:{color:0xd8efff,alpha:.07,radius:.5},
  }
  return presets[mode]||presets.warm
}
