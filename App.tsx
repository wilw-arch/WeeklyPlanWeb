import React, { useState, useEffect, useRef } from 'react';
import { WeekData } from './types';
import { createDefaultWeek } from './utils';
import WeeklyPlanner from './components/WeeklyPlanner';
import { PlusCircle, Calendar, Menu, Download, Upload, Database } from 'lucide-react';

function App() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('weekly_planner_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.sort((a: WeekData, b: WeekData) => b.id.localeCompare(a.id));
        setWeeks(parsed);
        if (parsed.length > 0) setSelectedWeekId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
      const initial = createDefaultWeek(new Date());
      setWeeks([initial]);
      setSelectedWeekId(initial.id);
    }
  }, []);

  const saveWeeks = (newWeeks: WeekData[]) => {
    setWeeks(newWeeks);
    localStorage.setItem('weekly_planner_data', JSON.stringify(newWeeks));
  };

  const handleUpdateCurrentWeek = (updatedData: WeekData) => {
    const newWeeks = weeks.map(w => w.id === updatedData.id ? updatedData : w);
    saveWeeks(newWeeks);
  };

  const createNewWeek = () => {
    let nextDate = new Date();
    if (weeks.length > 0) {
      const sorted = [...weeks].sort((a, b) => b.id.localeCompare(a.id));
      const latest = new Date(sorted[0].id);
      latest.setDate(latest.getDate() + 7);
      nextDate = latest;
    }
    const newWeek = createDefaultWeek(nextDate);
    if (weeks.some(w => w.id === newWeek.id)) {
        alert("该周的计划已存在。");
        setSelectedWeekId(newWeek.id);
        return;
    }
    const newWeeks = [newWeek, ...weeks].sort((a, b) => b.id.localeCompare(a.id));
    saveWeeks(newWeeks);
    setSelectedWeekId(newWeek.id);
  };

  const handleDeleteWeek = () => {
    if (!selectedWeekId) return;
    if (confirm("确定要删除本周计划吗？此操作不可撤销。")) {
      const newWeeks = weeks.filter(w => w.id !== selectedWeekId);
      saveWeeks(newWeeks);
      if (newWeeks.length > 0) {
        setSelectedWeekId(newWeeks[0].id);
      } else {
        setSelectedWeekId(null);
      }
    }
  };

  // --- Archiving Logic ---

  const exportData = () => {
    const dataStr = JSON.stringify(weeks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `weekly_planner_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedWeeks = JSON.parse(content);
        if (Array.isArray(importedWeeks)) {
          saveWeeks(importedWeeks);
          if (importedWeeks.length > 0) setSelectedWeekId(importedWeeks[0].id);
          alert("导入成功！数据已更新。");
        }
      } catch (err) {
        alert("导入失败：文件格式不正确。");
      }
    };
    fileReader.readAsText(file);
  };

  const currentWeekData = weeks.find(w => w.id === selectedWeekId);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50">
          <h1 className="font-bold text-orange-600 flex items-center gap-2">
            <Calendar size={20} />
            历史周报
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
           <button 
            onClick={createNewWeek}
            className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium mb-4 shadow-sm"
          >
            <PlusCircle size={18} /> 新建周计划
          </button>

          {weeks.map(week => (
            <button
              key={week.id}
              onClick={() => setSelectedWeekId(week.id)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                selectedWeekId === week.id 
                  ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-inner' 
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold truncate">{week.title.split('(')[0]}</div>
              <div className={`text-xs mt-1 ${selectedWeekId === week.id ? 'text-orange-600' : 'text-gray-400'}`}>
                {week.startDate} 至 {week.endDate}
              </div>
            </button>
          ))}
        </div>

        {/* Archiving & Persistence Section */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Database size={10} /> 数据存档管理
          </div>
          <button 
            onClick={exportData}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
          >
            <span>导出 JSON 备份</span>
            <Download size={14} className="text-gray-400" />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
          >
            <span>导入本地存档</span>
            <Upload size={14} className="text-gray-400" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={importData} 
            className="hidden" 
            accept=".json"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-orange-500 md:hidden"
        >
            <Menu size={20} />
        </button>

        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-0">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded hover:bg-gray-100 hidden md:block transition-colors">
                  <Menu size={20} className="text-gray-600"/>
              </button>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">周计划复盘工具</h2>
           </div>
           <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             已记录 {weeks.length} 周数据
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#fdfdfd]">
          <div className="max-w-6xl mx-auto">
            {currentWeekData ? (
              <WeeklyPlanner 
                data={currentWeekData} 
                onChange={handleUpdateCurrentWeek}
                onSave={() => alert("计划已更新并在本地浏览器保存。")}
                onDelete={handleDeleteWeek}
              />
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                <p className="text-xl text-gray-400 mb-6 font-light">还没有任何周计划，开始第一步吧！</p>
                <button 
                  onClick={createNewWeek}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all transform hover:-translate-y-1"
                >
                  创建第一个周计划
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;