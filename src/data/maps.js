export const maps = [
  {
    id: 'world',
    name: '월드맵',
    type: 'overworld',
    width: 20,
    height: 15,
    tiles: [
      // 2차원 배열로 타일 정보(0:잔디, 1:길, 2:마을, 3:던전 등)
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
      [0,1,2,3,3,2,2,3,3,2,2,3,3,2,2,3,3,2,1,0],
      [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // ... (height만큼 반복)
    ],
    objects: [
      { type: 'npc', id: 'elder', x: 2, y: 2 },
      { type: 'shop', id: 'main_shop', x: 5, y: 2 },
      { type: 'dungeon', id: 'main_dungeon', x: 10, y: 3 },
    ]
  },
  {
    id: 'town',
    name: '시작 마을',
    type: 'town',
    width: 10,
    height: 8,
    tiles: [
      // ...
    ],
    objects: [
      { type: 'npc', id: 'elder', x: 2, y: 2 },
      { type: 'shop', id: 'main_shop', x: 5, y: 2 },
    ]
  },
  {
    id: 'dungeon',
    name: '어둠의 던전',
    type: 'dungeon',
    width: 12,
    height: 10,
    tiles: [
      // ...
    ],
    objects: [
      { type: 'boss', id: 'shadow_lord', x: 6, y: 5 },
    ]
  },
]; 