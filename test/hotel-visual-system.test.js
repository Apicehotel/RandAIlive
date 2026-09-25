import test from 'node:test'
import assert from 'node:assert/strict'
import { MATERIALS, propLayout, roomLight, visualForRoom } from '../src/hotel-visual-system.js'

test('hotel rooms have function-specific visual identities',()=>{
  assert.equal(visualForRoom('bar').material,'parquet')
  assert.ok(visualForRoom('laundry').props.includes('washer'))
  assert.ok(visualForRoom('technical').props.includes('workbench'))
  assert.ok(visualForRoom('jazz3').props.includes('bed'))
  assert.equal(visualForRoom('wine7').wall,'wine')
})

test('room props are deterministic and remain inside the room footprint',()=>{
  const room={name:'reception',x:100,y:200,width:220,height:150}
  const a=propLayout(room),b=propLayout(room)
  assert.deepEqual(a,b)
  assert.ok(a.length>=4)
  for(const prop of a){
    assert.ok(prop.x>room.x&&prop.x<room.x+room.width)
    assert.ok(prop.y>room.y&&prop.y<room.y+room.height)
  }
})

test('surface and light recipes stay explicit',()=>{
  assert.ok(MATERIALS.parquet.base)
  assert.equal(roomLight({name:'hub'}).color,0x55dcff)
  assert.ok(roomLight({name:'bar'}).alpha>roomLight({name:'kitchen'}).alpha)
})
