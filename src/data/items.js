export const items = [
  {
    id: 'potion',
    name: '회복약',
    type: 'consumable',
    effect: { hp: +50 },
    description: 'HP를 50 회복한다.',
    icon: '/assets/potion.png'
  },
  {
    id: 'elixir',
    name: '엘릭서',
    type: 'consumable',
    effect: { hp: +100, mp: +50 },
    description: 'HP 100, MP 50 회복.',
    icon: '/assets/elixir.png'
  },
  {
    id: 'iron_sword',
    name: '강철 검',
    type: 'weapon',
    stat: { atk: +8 },
    description: '기본적인 강철로 만든 검.',
    icon: '/assets/iron_sword.png'
  },
  {
    id: 'leather_armor',
    name: '가죽 갑옷',
    type: 'armor',
    stat: { def: +5 },
    description: '가볍고 튼튼한 갑옷.',
    icon: '/assets/leather_armor.png'
  },
]; 