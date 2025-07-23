export const quests = [
  {
    id: 'main1',
    name: '왕국의 위기',
    description: '마을 장로와 대화하여 모험을 시작하세요.',
    type: 'main',
    requirements: [],
    rewards: [{ type: 'item', id: 'potion', amount: 2 }],
    next: 'main2',
  },
  {
    id: 'main2',
    name: '던전의 그림자',
    description: '던전에서 그림자 군주를 처치하세요.',
    type: 'main',
    requirements: ['main1'],
    rewards: [{ type: 'item', id: 'elixir', amount: 1 }],
    next: null,
  },
  {
    id: 'side1',
    name: '슬라임 퇴치',
    description: '슬라임 3마리를 처치하세요.',
    type: 'side',
    requirements: [],
    rewards: [{ type: 'item', id: 'potion', amount: 1 }],
    next: null,
  },
]; 