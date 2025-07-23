export const characters = [
  {
    id: 'hero',
    name: '아르테미스',
    class: '전사',
    level: 1,
    stats: { hp: 120, mp: 20, atk: 18, def: 10, spd: 8 },
    skills: ['slash', 'guard'],
    sprite: '/assets/hero.png',
    portrait: '/assets/hero_face.png',
    description: '용맹한 왕국의 기사. 정의감이 강하다.'
  },
  {
    id: 'mage',
    name: '세라',
    class: '마법사',
    level: 1,
    stats: { hp: 70, mp: 60, atk: 8, def: 6, spd: 10 },
    skills: ['fireball', 'heal'],
    sprite: '/assets/mage.png',
    portrait: '/assets/mage_face.png',
    description: '고대 마법을 연구하는 현자.'
  },
  {
    id: 'archer',
    name: '레온',
    class: '궁수',
    level: 1,
    stats: { hp: 90, mp: 30, atk: 14, def: 8, spd: 14 },
    skills: ['arrow_shot', 'evasion'],
    sprite: '/assets/archer.png',
    portrait: '/assets/archer_face.png',
    description: '숲의 수호자. 민첩하고 명중률이 높다.'
  },
  // 동료/적 캐릭터도 추가 가능
]; 