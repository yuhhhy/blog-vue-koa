<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

// 常量定义
const CONSTANTS = {
  DAY_WIDTH: 30,
  TASK_HEIGHT: 48,
  HEADER_HEIGHT: 64,
  MONTH_NAMES: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  TASK_COLORS: {
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    YELLOW: 'bg-yellow-500',
    PURPLE: 'bg-purple-500',
    RED: 'bg-red-500',
    ORANGE: 'bg-orange-500'
  }
};

// 优化任务数据结构
const tasks = ref([
  { 
    id: 1, 
    name: '需求分析', 
    startDate: '2025-06-10', 
    endDate: '2025-06-15',
    progress: 100,
    color: CONSTANTS.TASK_COLORS.BLUE,
    description: '收集和分析项目需求'
  },
  { 
    id: 2, 
    name: '设计阶段', 
    startDate: '2025-06-16', 
    endDate: '2025-06-22',
    progress: 70,
    color: CONSTANTS.TASK_COLORS.GREEN,
    description: 'UI/UX设计和技术架构设计'
  },
  { 
    id: 3, 
    name: '开发阶段', 
    startDate: '2025-06-23', 
    endDate: '2025-07-10',
    progress: 30,
    color: CONSTANTS.TASK_COLORS.YELLOW,
    description: '前后端开发实现'
  },
  { 
    id: 4, 
    name: '测试阶段', 
    startDate: '2025-07-11', 
    endDate: '2025-07-20',
    progress: 0,
    color: CONSTANTS.TASK_COLORS.PURPLE,
    description: '功能测试和性能测试'
  }
]);

// 日期处理
const startDate = ref('2025-06-10');
const endDate = ref('2025-07-20');

// 计算总天数
const totalDays = computed(() => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
});

// 生成日期数组
const dateArray = computed(() => {
  const dates = [];
  const start = new Date(startDate.value);
  
  for (let i = 0; i < totalDays.value; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    dates.push({
      date: currentDate.toISOString().split('T')[0],
      display: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      isFirstOfMonth: currentDate.getDate() === 1
    });
  }
  
  return dates;
});

// 计算月份标签
const monthLabels = computed(() => {
  const months = [];
  let currentMonth = null;
  let count = 0;
  
  dateArray.value.forEach((dateInfo, index) => {
    if (currentMonth !== dateInfo.month) {
      if (currentMonth !== null) {
        months.push({
          month: currentMonth,
          width: count,
          start: index - count
        });
      }
      currentMonth = dateInfo.month;
      count = 1;
    } else {
      count++;
    }
  });
  
  if (count > 0) {
    months.push({
      month: currentMonth,
      width: count,
      start: dateArray.value.length - count
    });
  }
  
  return months;
});

// 计算任务位置和宽度
const getTaskStyle = (task) => {
  const startDateObj = new Date(task.startDate);
  const endDateObj = new Date(task.endDate);
  const start = new Date(startDate.value);
  
  const taskStartDay = Math.ceil((startDateObj - start) / (1000 * 60 * 60 * 24));
  const taskDuration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    marginLeft: `${taskStartDay * CONSTANTS.DAY_WIDTH}px`,
    width: `${taskDuration * CONSTANTS.DAY_WIDTH}px`,
  };
};

const handleTaskClick = (task) => {
  ElMessage.info(`任务: ${task.name}, 进度: ${task.progress}%`);
};

// 计算容器宽度，确保没有多余空白
const containerWidth = computed(() => {
  return `${dateArray.value.length * CONSTANTS.DAY_WIDTH}px`;
});
</script>

<template>
  <div class="gantt-chart w-full overflow-auto">
    <h2 class="text-xl font-bold mb-4">项目甘特图</h2>
    
    <!-- 甘特图容器 -->
    <div class="flex bg-white shadow rounded-lg overflow-hidden">
      <!-- 任务名称列 -->
      <div class="min-w-[200px] border-r">
        <div class="h-16 bg-gray-100 p-2 font-bold border-b flex items-end justify-center">
          <div>任务名称</div>
        </div>
        <div>
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="h-12 p-2 border-b flex items-center justify-center hover:bg-gray-50"
          >
            {{ task.name }}
          </div>
        </div>
      </div>
      
      <!-- 时间轴和任务条 -->
      <div class="overflow-x-auto flex-1">
        <!-- 月份头部 -->
        <div class="h-8 bg-gray-100 flex border-b" :style="{ width: containerWidth }">
          <div 
            v-for="(month, index) in monthLabels" 
            :key="index"
            class="border-r flex items-center justify-center font-semibold"
            :style="{ width: `${month.width * CONSTANTS.DAY_WIDTH}px` }"
          >
            {{ CONSTANTS.MONTH_NAMES[month.month - 1] }}
          </div>
        </div>
        
        <!-- 日期头部 -->
        <div class="h-8 bg-gray-100 flex border-b" :style="{ width: containerWidth }">
          <div 
            v-for="(date, index) in dateArray" 
            :key="index"
            class="w-[30px] flex items-center justify-center text-xs border-r"
            :class="{ 'border-l-2 border-l-gray-400': date.isFirstOfMonth }"
          >
            {{ date.display }}
          </div>
        </div>
        
        <!-- 任务条区域 -->
        <div :style="{ width: containerWidth }">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="h-12 border-b relative"
          >
            <!-- 背景网格 -->
            <div class="absolute inset-0 flex">
              <div 
                v-for="(date, index) in dateArray" 
                :key="index"
                class="w-[30px] h-full border-r"
                :class="{ 'border-l-2 border-l-gray-400': date.isFirstOfMonth }"
              ></div>
            </div>
            
            <!-- 任务条 -->
            <div 
              class="absolute top-2 h-8 rounded cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]"
              :class="task.color"
              :style="getTaskStyle(task)"
              @click="handleTaskClick(task)"
            >
              <div class="h-full overflow-hidden">
                <div class="h-full" :style="{ width: `${task.progress}%`, opacity: 0.3 }"></div>
                <div class="text-xs text-white font-bold px-2 absolute top-1/2 transform -translate-y-1/2 whitespace-nowrap">
                  {{ task.name }} ({{ task.progress }}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图例 -->
    <div class="mt-4 flex gap-4">
      <div v-for="task in tasks" :key="task.id" class="flex items-center">
        <div :class="['w-4 h-4 rounded', task.color]"></div>
        <span class="ml-1 text-sm">{{ task.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>