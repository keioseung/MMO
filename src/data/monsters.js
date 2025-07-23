export const monsters = [
  {
    id: 'slime',
    name: '슬라임',
    level: 1,
    stats: { hp: 30, atk: 6, def: 2, spd: 4 },
    skills: ['body_slam'],
    sprite: '/assets/slime.png',
    description: '초원에서 흔히 볼 수 있는 젤리형 몬스터.'
  },
  {
    id: 'goblin',
    name: '고블린',
    level: 2,
    stats: { hp: 45, atk: 10, def: 4, spd: 7 },
    skills: ['club_attack'],
    sprite: '/assets/goblin.png',
    description: '숲과 동굴에 서식하는 소형 몬스터.'
  },
  {
    id: 'shadow_lord',
    name: '그림자 군주',
    level: 10,
    stats: { hp: 300, atk: 40, def: 20, spd: 12 },
    skills: ['dark_blast', 'summon_minions'],
    sprite: '/assets/shadow_lord.png',
    description: '던전의 최종 보스. 강력한 어둠의 힘을 다룬다.'
  },
]; 