import React, { useMemo } from 'react';
import { WeekData, HabitCategory, HabitItem, MetricItem, BigEvent } from '../types';
import { getWeekRange } from '../utils';
import { Save, Trash2 } from 'lucide-react';

interface WeeklyPlannerProps {
  data: WeekData;
  onChange: (newData: WeekData) => void;
  onSave: () => void;
  onDelete: () => void;
}

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ data, onChange, onSave, onDelete }) => {
  const weekDays = useMemo(() => getWeekRange(data.startDate), [data.startDate]);

  // --- Handlers ---

  const updateBigEvent = (index: number, field: keyof BigEvent, value: string) => {
    const newEvents = [...data.bigEvents];
    newEvents[index] = { ...newEvents[index], [field]: value };
    onChange({ ...data, bigEvents: newEvents });
  };

  const updateHabitCheck = (catIndex: number, itemIndex: number, dayIndex: number) => {
    const newCats = [...data.habitCategories];
    const item = newCats[catIndex].items[itemIndex];
    const newDays = [...item.days];
    newDays[dayIndex] = !newDays[dayIndex];
    newCats[catIndex].items[itemIndex] = { ...item, days: newDays };
    onChange({ ...data, habitCategories: newCats });
  };

  const updateHabitField = (catIndex: number, itemIndex: number, field: keyof HabitItem, value: any) => {
    const newCats = [...data.habitCategories];
    newCats[catIndex].items[itemIndex] = { ...newCats[catIndex].items[itemIndex], [field]: value };
    onChange({ ...data, habitCategories: newCats });
  };
  
  const updateHabitName = (catIndex: number, itemIndex: number, value: string) => {
    updateHabitField(catIndex, itemIndex, 'name', value);
  };

  const updateMetricDay = (itemIndex: number, dayIndex: number, value: string) => {
    const newMetrics = [...data.metrics];
    const newDays = [...newMetrics[itemIndex].days];
    newDays[dayIndex] = value;
    newMetrics[itemIndex] = { ...newMetrics[itemIndex], days: newDays };
    onChange({ ...data, metrics: newMetrics });
  };

  const updateMetricField = (itemIndex: number, field: keyof MetricItem, value: any) => {
    const newMetrics = [...data.metrics];
    newMetrics[itemIndex] = { ...newMetrics[itemIndex], [field]: value };
    onChange({ ...data, metrics: newMetrics });
  };

  const updateReview = (field: keyof typeof data.review, value: string) => {
    onChange({ ...data, review: { ...data.review, [field]: value } });
  };

  // --- Render Helpers ---

  const calculateHabitStats = (item: HabitItem) => {
    const completed = item.days.filter(Boolean).length;
    const rate = item.target > 0 ? (completed / item.target) * 100 : 0;
    return { completed, rate: Math.min(rate, 100).toFixed(2) }; // Cap at 100% for display logic if needed, though raw might be >100
  };

  // Fix: Explicitly type return values and handle numeric conversion to avoid 'left-hand side' arithmetic errors
  const calculateMetricStats = (item: MetricItem): { total: number; diff: number } => {
    const total = item.days.reduce((acc: number, val: string | number): number => {
      const num = Number(val);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    const diff = total - (item.target || 0);
    return { total, diff };
  };

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      {/* Header Actions */}
      <div className="bg-orange-50 p-4 border-b border-orange-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <input 
          value={data.title}
          onChange={(e) => onChange({...data, title: e.target.value})}
          className="text-2xl font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none text-center md:text-left w-full md:w-auto transition-colors"
        />
        <div className="flex gap-2">
            <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
            <Trash2 size={16} /> Delete
          </button>
          <button onClick={onSave} className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white font-semibold rounded shadow hover:bg-orange-600 transition-colors">
            <Save size={18} /> Save Plan
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px] p-6 space-y-6">
          
          {/* Section 1: Big Events */}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-400 p-2 w-32">类型 (Type)</th>
                <th className="border border-gray-400 p-2">事项 (Item)</th>
                <th className="border border-gray-400 p-2 w-64">完成情况 (Status)</th>
              </tr>
            </thead>
            <tbody>
              {data.bigEvents.map((event, idx) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">{event.type}</td>
                  <td className="border border-gray-300 p-0">
                    <input 
                      type="text" 
                      className="w-full h-full p-2 outline-none bg-transparent"
                      value={event.content}
                      onChange={(e) => updateBigEvent(idx, 'content', e.target.value)}
                      placeholder="Add an event..."
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input 
                      type="text" 
                      className="w-full h-full p-2 outline-none bg-transparent text-center"
                      value={event.status}
                      onChange={(e) => updateBigEvent(idx, 'status', e.target.value)}
                      placeholder="Status..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Section 2: Habits (Self Discipline) */}
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-orange-100">
                <th className="border border-gray-400 p-2 w-24">自律打卡</th>
                <th className="border border-gray-400 p-2">类目 (Category)</th>
                <th className="border border-gray-400 p-2 w-16">目标</th>
                {weekDays.map(day => (
                  <th key={day.dateStr} className="border border-gray-400 p-1 w-12 text-center">
                    <div className="text-xs font-bold">{day.display}</div>
                    <div className="text-[10px] text-gray-500">{day.dayIndex}</div>
                  </th>
                ))}
                <th className="border border-gray-400 p-2 w-16">完成</th>
                <th className="border border-gray-400 p-2 w-20">完成率</th>
                <th className="border border-gray-400 p-2 w-48">备注</th>
              </tr>
            </thead>
            <tbody>
              {data.habitCategories.map((cat, catIdx) => (
                <React.Fragment key={cat.name}>
                  {cat.items.map((item, itemIdx) => {
                    const stats = calculateHabitStats(item);
                    const rateNum = parseFloat(stats.rate);
                    let rateColor = 'text-red-500';
                    if (rateNum >= 100) rateColor = 'text-green-600 font-bold';
                    else if (rateNum >= 60) rateColor = 'text-orange-500';

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        {itemIdx === 0 && (
                          <td rowSpan={cat.items.length} className="border border-gray-300 p-2 text-center font-bold bg-orange-50">
                            {cat.name}
                          </td>
                        )}
                        <td className="border border-gray-300 p-0">
                          <input 
                            className="w-full h-full p-2 outline-none bg-transparent"
                            value={item.name}
                            onChange={(e) => updateHabitName(catIdx, itemIdx, e.target.value)} 
                          />
                        </td>
                        <td className="border border-gray-300 p-0">
                           <input 
                            type="number"
                            className="w-full h-full p-1 text-center outline-none bg-transparent"
                            value={item.target}
                            onChange={(e) => updateHabitField(catIdx, itemIdx, 'target', parseInt(e.target.value) || 0)} 
                          />
                        </td>
                        {item.days.map((checked, dIdx) => (
                          <td 
                            key={dIdx} 
                            className={`border border-gray-300 text-center cursor-pointer transition-colors ${checked ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
                            onClick={() => updateHabitCheck(catIdx, itemIdx, dIdx)}
                          >
                            {checked ? '✓' : '×'}
                          </td>
                        ))}
                        <td className="border border-gray-300 text-center font-medium">{stats.completed}</td>
                        <td className={`border border-gray-300 text-center ${rateColor}`}>{stats.rate}%</td>
                        <td className="border border-gray-300 p-0">
                           <input 
                            className="w-full h-full p-2 outline-none bg-transparent"
                            value={item.remarks}
                            placeholder="Add remarks..."
                            onChange={(e) => updateHabitField(catIdx, itemIdx, 'remarks', e.target.value)} 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Section 3: Metrics (Finance/Weight) */}
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 w-24">坚持</th>
                <th className="border border-gray-400 p-2">类目 (Category)</th>
                <th className="border border-gray-400 p-2 w-16">目标</th>
                {weekDays.map(day => (
                  <th key={day.dateStr} className="border border-gray-400 p-1 w-12 text-center">
                    <div className="text-xs font-bold">{day.display}</div>
                  </th>
                ))}
                <th className="border border-gray-400 p-2 w-16">完成</th>
                <th className="border border-gray-400 p-2 w-20">超出目标</th>
                <th className="border border-gray-400 p-2 w-48">备注</th>
              </tr>
            </thead>
            <tbody>
              {data.metrics.map((item, idx) => {
                const stats = calculateMetricStats(item);
                const diffColor = stats.diff >= 0 ? 'text-green-600' : 'text-red-500';

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {idx === 0 && (
                      <td rowSpan={data.metrics.length} className="border border-gray-300 p-2 text-center font-bold bg-gray-100">
                        财务/体重
                      </td>
                    )}
                    <td className="border border-gray-300 p-0">
                      <input 
                        className="w-full h-full p-2 outline-none bg-transparent"
                        value={item.name}
                        onChange={(e) => updateMetricField(idx, 'name', e.target.value)} 
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input 
                        type="number"
                        className="w-full h-full p-1 text-center outline-none bg-transparent"
                        value={item.target}
                        onChange={(e) => updateMetricField(idx, 'target', parseFloat(e.target.value) || 0)} 
                      />
                    </td>
                    {item.days.map((val, dIdx) => (
                      <td key={dIdx} className="border border-gray-300 p-0">
                        <input 
                          type="number" 
                          className="w-full h-full p-1 text-center outline-none bg-transparent text-gray-700"
                          value={val}
                          onChange={(e) => updateMetricDay(idx, dIdx, e.target.value)} 
                        />
                      </td>
                    ))}
                    {/* Fix: stats.total and stats.diff are guaranteed numbers, but explicit casting avoids toFixed errors on ambiguous types */}
                    <td className="border border-gray-300 text-center font-medium">
                      {Number.isInteger(stats.total) ? stats.total : (stats.total as number).toFixed(2)}
                    </td>
                    <td className={`border border-gray-300 text-center font-bold ${diffColor}`}>
                      {stats.diff > 0 ? '+' : ''}{Number.isInteger(stats.diff) ? stats.diff : (stats.diff as number).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input 
                        className="w-full h-full p-2 outline-none bg-transparent"
                        value={item.remarks}
                        placeholder="Remarks..."
                        onChange={(e) => updateMetricField(idx, 'remarks', e.target.value)} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Section 4: Review Quadrant */}
          <div className="border border-gray-300 rounded-sm overflow-hidden flex flex-col">
            <div className="bg-yellow-100 p-2 text-center font-bold border-b border-gray-300">本周复盘 (Weekly Review)</div>
            <div className="flex flex-col md:flex-row border-b border-gray-300">
               <div className="flex-1 border-r border-gray-300 bg-orange-50 flex flex-col min-h-[120px]">
                 <div className="p-2 font-bold text-center border-b border-orange-100 text-orange-800">输入 (Input)</div>
                 <textarea 
                    className="flex-1 p-3 bg-transparent resize-none outline-none min-h-[100px]" 
                    value={data.review.input}
                    onChange={(e) => updateReview('input', e.target.value)}
                    placeholder="E.g., Read 'Book Name', Course X..."
                 />
               </div>
               <div className="flex-1 bg-orange-50 flex flex-col min-h-[120px]">
                 <div className="p-2 font-bold text-center border-b border-orange-100 text-orange-800">输出 (Output)</div>
                 <textarea 
                    className="flex-1 p-3 bg-transparent resize-none outline-none min-h-[100px]"
                    value={data.review.output}
                    onChange={(e) => updateReview('output', e.target.value)}
                    placeholder="E.g., 2 Articles, 5 Videos..."
                 />
               </div>
            </div>
            <div className="flex flex-col md:flex-row">
               <div className="flex-1 border-r border-gray-300 bg-yellow-50 flex flex-col min-h-[120px]">
                 <div className="p-2 font-bold text-center border-b border-yellow-100 text-yellow-800">保持 (Keep)</div>
                 <textarea 
                    className="flex-1 p-3 bg-transparent resize-none outline-none min-h-[100px]"
                    value={data.review.keep}
                    onChange={(e) => updateReview('keep', e.target.value)}
                    placeholder="Things done well..."
                 />
               </div>
               <div className="flex-1 bg-yellow-50 flex flex-col min-h-[120px]">
                 <div className="p-2 font-bold text-center border-b border-yellow-100 text-yellow-800">停止/改进 (Stop/Improve)</div>
                 <textarea 
                    className="flex-1 p-3 bg-transparent resize-none outline-none min-h-[100px]"
                    value={data.review.improve}
                    onChange={(e) => updateReview('improve', e.target.value)}
                    placeholder="Things to change..."
                 />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;