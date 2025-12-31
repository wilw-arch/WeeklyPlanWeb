import { WeekData, HabitCategory, MetricItem, BigEvent } from './types';

export const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}`;
};

export const getWeekRange = (startDateStr: string) => {
  const start = new Date(startDateStr);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      display: formatDateShort(d.toISOString()),
      dayIndex: i + 1 // 1-7
    });
  }
  return days;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getMonday = (d: Date) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};

export const createDefaultWeek = (startDate: Date): WeekData => {
  const monday = getMonday(startDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startIso = monday.toISOString().split('T')[0];
  const endIso = sunday.toISOString().split('T')[0];

  return {
    id: startIso,
    title: `${monday.getMonth() + 1}月-周计划复盘 (${formatDateShort(startIso)}-${formatDateShort(endIso)})`,
    startDate: startIso,
    endDate: endIso,
    bigEvents: [
      { id: generateId(), type: '一件必须要做的事情', content: '', status: '' },
      { id: generateId(), type: '一件尝试要做的事情', content: '', status: '' },
      { id: generateId(), type: '一件坚持要做的事情', content: '', status: '' },
    ],
    habitCategories: [
      {
        name: '日常生活',
        items: [
          { id: generateId(), name: '早起: 6:30起床', target: 7, days: Array(7).fill(false), remarks: '' },
          { id: generateId(), name: '早睡: 10:30放下手机', target: 7, days: Array(7).fill(false), remarks: '' },
          { id: generateId(), name: '站立10分钟', target: 7, days: Array(7).fill(false), remarks: '' },
          { id: generateId(), name: '喝水', target: 3, days: Array(7).fill(false), remarks: '' },
        ]
      },
      {
        name: '工作学习',
        items: [
          { id: generateId(), name: '工作时长不低于6小时', target: 6, days: Array(7).fill(false), remarks: '' },
          { id: generateId(), name: '学习1小时', target: 7, days: Array(7).fill(false), remarks: '' },
          { id: generateId(), name: '发朋友圈5条', target: 3, days: Array(7).fill(false), remarks: '' },
        ]
      },
      {
        name: '健康运动',
        items: [
          { id: generateId(), name: '晚上不吃饭', target: 7, days: Array(7).fill(false), remarks: '' },
          { id: generateId(), name: '运动20分钟', target: 3, days: Array(7).fill(false), remarks: '' },
        ]
      }
    ],
    metrics: [
      { id: generateId(), name: '见客户', target: 20, days: Array(7).fill(''), remarks: '' },
      { id: generateId(), name: '聊客户', target: 200, days: Array(7).fill(''), remarks: '' },
      { id: generateId(), name: '支出', target: 1000, days: Array(7).fill(''), remarks: '' },
    ],
    review: {
      input: '',
      output: '',
      keep: '',
      improve: ''
    }
  };
};