// 添加一些视觉增强功能

// 初始化数据库
async function initDB() {
    try {
        await studyDB.init();
        console.log('数据库初始化成功');
        // 从localStorage迁移数据到IndexedDB
        await migrateDataFromLocalStorage();
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
}

// 从localStorage迁移数据到IndexedDB
async function migrateDataFromLocalStorage() {
    // 迁移待办事项
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    for (const todo of todos) {
        try {
            await studyDB.add('todos', todo);
        } catch (e) {
            // 如果已存在则跳过
            if (e.name !== 'ConstraintError') {
                console.error('迁移待办事项失败:', e);
            }
        }
    }
    
    // 迁移提醒
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    for (const reminder of reminders) {
        try {
            await studyDB.add('reminders', reminder);
        } catch (e) {
            if (e.name !== 'ConstraintError') {
                console.error('迁移提醒失败:', e);
            }
        }
    }
    
    // 迁移复盘记录
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    for (const review of reviews) {
        try {
            // 添加ID如果不存在
            if (!review.id) {
                review.id = Date.now() + Math.random();
            }
            await studyDB.add('reviews', review);
        } catch (e) {
            if (e.name !== 'ConstraintError') {
                console.error('迁移复盘记录失败:', e);
            }
        }
    }
    
    // 迁移科目进度
    const subjectProgress = JSON.parse(localStorage.getItem('subjectProgress') || '{}');
    for (const subject in subjectProgress) {
        try {
            await studyDB.add('subjectProgress', {
                subject: subject,
                progress: subjectProgress[subject]
            });
        } catch (e) {
            if (e.name !== 'ConstraintError') {
                console.error('迁移科目进度失败:', e);
            }
        }
    }
    
    // 迁移学习时间
    const studyTime = JSON.parse(localStorage.getItem('studyTime') || '{}');
    for (const date in studyTime) {
        for (const subject in studyTime[date]) {
            try {
                await studyDB.add('studyTime', {
                    id: `${date}-${subject}`,
                    date: date,
                    subject: subject,
                    minutes: studyTime[date][subject]
                });
            } catch (e) {
                if (e.name !== 'ConstraintError') {
                    console.error('迁移学习时间失败:', e);
                }
            }
        }
    }
    
    // 迁移知识点
    const knowledgePoints = JSON.parse(localStorage.getItem('knowledgePoints') || '[]');
    for (const point of knowledgePoints) {
        try {
            if (!point.id) {
                point.id = Date.now() + Math.random();
            }
            await studyDB.add('knowledgePoints', point);
        } catch (e) {
            if (e.name !== 'ConstraintError') {
                console.error('迁移知识点失败:', e);
            }
        }
    }
    
    // 迁移错题
    const mistakes = JSON.parse(localStorage.getItem('mistakes') || '[]');
    for (const mistake of mistakes) {
        try {
            if (!mistake.id) {
                mistake.id = Date.now() + Math.random();
            }
            await studyDB.add('mistakes', mistake);
        } catch (e) {
            if (e.name !== 'ConstraintError') {
                console.error('迁移错题失败:', e);
            }
        }
    }
    
    // 迁移学习计划
    const planTasks = JSON.parse(localStorage.getItem('planTasks') || '[]');
    for (const task of planTasks) {
        try {
            if (!task.id) {
                task.id = Date.now() + Math.random();
            }
            await studyDB.add('planTasks', task);
        } catch (e) {
            if (e.name !== 'ConstraintError') {
                console.error('迁移学习计划失败:', e);
            }
        }
    }
    
    console.log('数据迁移完成');
}

// 考研日期（2026年12月26日）
const examDate = new Date('2026-12-26');
const countdownElement = document.getElementById('countdown');

// 更新倒计时
function updateCountdown() {
    const now = new Date();
    const timeDiff = examDate - now;
    
    if (timeDiff <= 0) {
        countdownElement.textContent = "考试今天开始！";
        return;
    }
    
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    countdownElement.textContent = `距离考研还有 ${days} 天`;
    
    // 只在第一次更新时添加pulse动画，避免重复添加
    if (!countdownElement.classList.contains('pulse')) {
        countdownElement.classList.add('pulse');
    }
}

// 初始更新倒计时
updateCountdown();
// 每分钟更新一次倒计时
setInterval(updateCountdown, 60000);

// 数据导出功能
const exportExcelBtn = document.getElementById('export-excel');
const exportJsonBtn = document.getElementById('export-json');
const exportPdfBtn = document.getElementById('export-pdf');
const backupDataBtn = document.getElementById('backup-data');
const restoreDataBtn = document.getElementById('restore-data');
const restoreFileInput = document.getElementById('restore-file');
const exportStatus = document.getElementById('export-status');

// 导出为Excel
exportExcelBtn.addEventListener('click', function() {
    showExportStatus('Excel导出功能需要额外库支持，这里提供JSON格式作为替代方案', 'error');
    exportJson();
});

// 导出为JSON
exportJsonBtn.addEventListener('click', exportJson);

async function exportJson() {
    try {
        // 收集所有数据
        const allData = {
            exportDate: new Date().toISOString(),
            todos: await studyDB.getAll('todos'),
            reminders: await studyDB.getAll('reminders'),
            reviews: await studyDB.getAll('reviews'),
            subjectProgress: await studyDB.getAll('subjectProgress'),
            studyTime: await studyDB.getAll('studyTime'),
            knowledgePoints: await studyDB.getAll('knowledgePoints'),
            mistakes: await studyDB.getAll('mistakes'),
            planTasks: await studyDB.getAll('planTasks')
        };
        
        // 创建JSON文件并下载
        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `考研备考数据_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showExportStatus('数据已成功导出为JSON文件', 'success');
    } catch (error) {
        showExportStatus('导出失败: ' + error.message, 'error');
    }
}

// 导出为PDF
exportPdfBtn.addEventListener('click', function() {
    showExportStatus('PDF导出功能需要额外库支持，这里提供JSON格式作为替代方案', 'error');
    exportJson();
});

// 备份数据
backupDataBtn.addEventListener('click', function() {
    exportJson();
});

// 恢复数据
restoreDataBtn.addEventListener('click', function() {
    restoreFileInput.click();
});

restoreFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 清空现有数据
            await studyDB.clear('todos');
            await studyDB.clear('reminders');
            await studyDB.clear('reviews');
            await studyDB.clear('subjectProgress');
            await studyDB.clear('studyTime');
            await studyDB.clear('knowledgePoints');
            await studyDB.clear('mistakes');
            await studyDB.clear('planTasks');
            
            // 恢复各项数据
            if (data.todos) {
                for (const todo of data.todos) {
                    await studyDB.add('todos', todo);
                }
            }
            
            if (data.reminders) {
                for (const reminder of data.reminders) {
                    await studyDB.add('reminders', reminder);
                }
            }
            
            if (data.reviews) {
                for (const review of data.reviews) {
                    await studyDB.add('reviews', review);
                }
            }
            
            if (data.subjectProgress) {
                for (const progress of data.subjectProgress) {
                    await studyDB.add('subjectProgress', progress);
                }
            }
            
            if (data.studyTime) {
                for (const time of data.studyTime) {
                    await studyDB.add('studyTime', time);
                }
            }
            
            if (data.knowledgePoints) {
                for (const point of data.knowledgePoints) {
                    await studyDB.add('knowledgePoints', point);
                }
            }
            
            if (data.mistakes) {
                for (const mistake of data.mistakes) {
                    await studyDB.add('mistakes', mistake);
                }
            }
            
            if (data.planTasks) {
                for (const task of data.planTasks) {
                    await studyDB.add('planTasks', task);
                }
            }
            
            showExportStatus('数据恢复成功，请刷新页面查看效果', 'success');
        } catch (error) {
            showExportStatus('数据恢复失败: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
});

// 显示导出状态
function showExportStatus(message, type) {
    exportStatus.textContent = message;
    exportStatus.className = type === 'success' ? 'status-success' : 'status-error';
    
    // 添加动画效果
    exportStatus.classList.add('fade-in');
    
    // 3秒后清除状态
    setTimeout(() => {
        exportStatus.classList.remove('fade-in');
        setTimeout(() => {
            exportStatus.textContent = '';
            exportStatus.className = '';
        }, 300);
    }, 3000);
}

async function exportJson() {
    try {
        // 收集所有数据
        const allData = {
            exportDate: new Date().toISOString(),
            todos: await studyDB.getAll('todos'),
            reminders: await studyDB.getAll('reminders'),
            reviews: await studyDB.getAll('reviews'),
            subjectProgress: await studyDB.getAll('subjectProgress'),
            studyTime: await studyDB.getAll('studyTime'),
            knowledgePoints: await studyDB.getAll('knowledgePoints'),
            mistakes: await studyDB.getAll('mistakes'),
            planTasks: await studyDB.getAll('planTasks')
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'kaoyan-data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showExportStatus('数据导出成功', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showExportStatus('导出失败: ' + error.message, 'error');
    }
}

// 知识点掌握情况跟踪功能
const knowledgeSubject = document.getElementById('knowledge-subject');
const newKnowledgePoint = document.getElementById('new-knowledge-point');
const addKnowledgePointBtn = document.getElementById('add-knowledge-point');
const knowledgePointsList = document.getElementById('knowledge-points-list');
const knowledgeFilters = document.querySelectorAll('.knowledge-filter');
let currentKnowledgeFilter = 'all';

// 加载知识点
async function loadKnowledgePoints() {
    try {
        const knowledgePoints = await studyDB.getAll('knowledgePoints');
        knowledgePoints.forEach(point => {
            addKnowledgePointToDOM(point.subject, point.content, point.status, point.id);
        });
        filterKnowledgePoints();
        generateRecommendations();
    } catch (error) {
        console.error('加载知识点失败:', error);
    }
}

// 添加知识点到DOM
function addKnowledgePointToDOM(subject, content, status = 'unmastered', id = Date.now().toString()) {
    const li = document.createElement('li');
    li.className = 'knowledge-point-item sortable-item fade-in';
    li.dataset.id = id;
    li.dataset.subject = subject;
    li.dataset.status = status;
    li.draggable = true;
    
    const subjectName = getSubjectName(subject);
    const statusText = getStatusText(status);
    const statusClass = `status-${status}`;
    
    li.innerHTML = `
        <div class="knowledge-point-content">
            <span class="knowledge-point-subject">${subjectName}</span>
            <span>${content}</span>
        </div>
        <span class="knowledge-point-status ${statusClass}">${statusText}</span>
        <div class="knowledge-point-actions">
            <button class="btn-unmastered" data-status="unmastered">未掌握</button>
            <button class="btn-basic" data-status="basic">基本掌握</button>
            <button class="btn-proficient" data-status="proficient">熟练掌握</button>
            <button class="btn-delete">删除</button>
        </div>
    `;
    
    // 添加拖拽事件
    addDragEvents(li);
    
    // 添加状态按钮事件
    const statusButtons = li.querySelectorAll('.knowledge-point-actions button:not(.btn-delete)');
    statusButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const newStatus = this.dataset.status;
            li.dataset.status = newStatus;
            
            const statusSpan = li.querySelector('.knowledge-point-status');
            statusSpan.className = 'knowledge-point-status ' + `status-${newStatus}`;
            statusSpan.textContent = getStatusText(newStatus);
            
            // 更新数据库
            try {
                const point = {
                    id: id,
                    subject: subject,
                    content: content,
                    status: newStatus
                };
                await studyDB.update('knowledgePoints', point);
                generateRecommendations();
            } catch (error) {
                console.error('更新知识点状态失败:', error);
            }
        });
    });
    
    // 添加删除按钮事件
    const deleteBtn = li.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', async function() {
        li.classList.add('fade-in');
        li.style.transform = 'translateX(100px)';
        li.style.opacity = '0';
        
        // 等待动画完成后再删除
        setTimeout(async () => {
            li.remove();
            try {
                await studyDB.delete('knowledgePoints', id);
                generateRecommendations();
            } catch (error) {
                console.error('删除知识点失败:', error);
            }
        }, 300);
    });
    
    knowledgePointsList.appendChild(li);
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'unmastered': '未掌握',
        'basic': '基本掌握',
        'proficient': '熟练掌握'
    };
    return statusMap[status] || status;
}

// 添加新知识点
async function addKnowledgePoint() {
    const subject = knowledgeSubject.value;
    const content = newKnowledgePoint.value.trim();
    
    if (!content) {
        showAnimationFeedback(newKnowledgePoint, 'error');
        alert('请输入知识点内容');
        return;
    }
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    try {
        // 保存到数据库
        const point = {
            id: id,
            subject: subject,
            content: content,
            status: 'unmastered'
        };
        await studyDB.add('knowledgePoints', point);
        
        // 添加到DOM
        addKnowledgePointToDOM(subject, content, 'unmastered', id);
        generateRecommendations();
        
        newKnowledgePoint.value = '';
        showAnimationFeedback(addKnowledgePointBtn, 'success');
    } catch (error) {
        console.error('添加知识点失败:', error);
        alert('添加知识点失败，请重试');
    }
}

// 过滤知识点
function filterKnowledgePoints() {
    const knowledgePoints = document.querySelectorAll('.knowledge-point-item');
    knowledgePoints.forEach(point => {
        if (currentKnowledgeFilter === 'all' || point.dataset.status === currentKnowledgeFilter) {
            point.style.display = 'flex';
            point.classList.add('fade-in');
        } else {
            point.style.display = 'none';
        }
    });
}

// 生成复习建议
async function generateRecommendations() {
    const recommendationsContent = document.getElementById('recommendations-content');
    try {
        const knowledgePoints = await studyDB.getAll('knowledgePoints');
        
        // 统计各科目未掌握的知识点数量
        const unmasteredPoints = {};
        knowledgePoints.forEach(point => {
            if (point.status === 'unmastered') {
                if (!unmasteredPoints[point.subject]) {
                    unmasteredPoints[point.subject] = 0;
                }
                unmasteredPoints[point.subject]++;
            }
        });
        
        // 生成建议
        let recommendationsHTML = '';
        
        if (Object.keys(unmasteredPoints).length === 0) {
            recommendationsHTML = '<p>恭喜！当前没有未掌握的知识点。</p>';
        } else {
            recommendationsHTML = '<p>根据您的知识点掌握情况，建议优先复习以下内容：</p>';
            for (const subject in unmasteredPoints) {
                const subjectName = getSubjectName(subject);
                const count = unmasteredPoints[subject];
                recommendationsHTML += `
                    <div class="recommendation-item slide-in">
                        ${subjectName} 有 ${count} 个知识点未掌握，建议安排专门时间进行复习。
                    </div>
                `;
            }
        }
        
        // 添加通用建议
        recommendationsHTML += `
            <div class="recommendation-item slide-in">
                建议每天安排固定时间复习未掌握的知识点，采用费曼学习法加深理解。
            </div>
            <div class="recommendation-item slide-in">
                对于基本掌握的知识点，可以通过做题来巩固提升。
            </div>
        `;
        
        recommendationsContent.innerHTML = recommendationsHTML;
    } catch (error) {
        console.error('生成复习建议失败:', error);
    }
}

addKnowledgePointBtn.addEventListener('click', addKnowledgePoint);

// 设置知识点过滤器事件
knowledgeFilters.forEach(button => {
    button.addEventListener('click', function() {
        knowledgeFilters.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentKnowledgeFilter = this.dataset.filter;
        filterKnowledgePoints();
    });
});

// 学习计划制定与跟踪功能
const planStage = document.getElementById('plan-stage');
const generatePlanBtn = document.getElementById('generate-plan');
const planTasks = document.getElementById('plan-tasks');

// 生成学习计划
async function generatePlan() {
    const stage = planStage.value;
    const stageText = planStage.options[planStage.selectedIndex].text;
    
    // 清空现有任务
    planTasks.innerHTML = '';
    
    // 根据阶段生成任务
    let tasks = [];
    
    switch(stage) {
        case 'foundation':
            tasks = [
                { content: '完成数学一高数基础复习', subject: 'math' },
                { content: '背诵英语一核心词汇', subject: 'english' },
                { content: '学习数据结构线性表章节', subject: 'data-structure' },
                { content: '学习计算机组成原理概述章节', subject: 'coa' },
                { content: '学习操作系统进程管理章节', subject: 'os' },
                { content: '学习计算机网络物理层和数据链路层', subject: 'cn' }
            ];
            break;
        case 'improvement':
            tasks = [
                { content: '完成数学一强化习题集', subject: 'math' },
                { content: '练习英语一阅读理解', subject: 'english' },
                { content: '完成数据结构树和图的练习题', subject: 'data-structure' },
                { content: '学习计算机组成原理CPU章节', subject: 'coa' },
                { content: '学习操作系统内存管理章节', subject: 'os' },
                { content: '学习计算机网络网络层', subject: 'cn' }
            ];
            break;
        case '冲刺阶段':
            tasks = [
                { content: '完成数学历年真题', subject: 'math' },
                { content: '完成英语一历年真题', subject: 'english' },
                { content: '完成数据结构综合题', subject: 'data-structure' },
                { content: '完成计算机组成原理综合题', subject: 'coa' },
                { content: '完成操作系统综合题', subject: 'os' },
                { content: '完成计算机网络综合题', subject: 'cn' },
                { content: '进行全真模拟考试', subject: 'other' }
            ];
            break;
    }
    
    // 添加任务到DOM和数据库
    for (const [index, task] of tasks.entries()) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9) + index;
        try {
            await studyDB.add('planTasks', {
                id: id,
                stage: stageText,
                content: task.content,
                subject: task.subject,
                completed: false,
                date: new Date().toLocaleDateString()
            });
            addPlanTaskToDOM(stageText, task.content, task.subject, false, id);
        } catch (error) {
            console.error('添加计划任务失败:', error);
        }
    }
    
    showAnimationFeedback(generatePlanBtn, 'success');
}

// 添加计划任务到DOM
function addPlanTaskToDOM(stage, content, subject, completed = false, id = Date.now()) {
    const li = document.createElement('li');
    li.className = `plan-task-item sortable-item ${completed ? 'plan-task-completed' : ''} fade-in`;
    li.dataset.id = id;
    li.dataset.subject = subject;
    li.draggable = true;
    
    const subjectName = getSubjectName(subject);
    
    li.innerHTML = `
        <input type="checkbox" class="plan-task-checkbox" ${completed ? 'checked' : ''}>
        <div class="plan-task-content">
            <span class="plan-task-stage">${stage}</span>
            <span>${content} (${subjectName})</span>
        </div>
        <span class="plan-task-date">${new Date().toLocaleDateString()}</span>
        <button class="plan-task-delete">删除</button>
    `;
    
    // 添加拖拽事件
    addDragEvents(li);
    
    // 添加完成状态切换事件
    const checkbox = li.querySelector('.plan-task-checkbox');
    checkbox.addEventListener('change', async function() {
        li.classList.toggle('plan-task-completed', this.checked);
        try {
            // 更新数据库
            await studyDB.update('planTasks', {
                id: id,
                completed: this.checked
            });
        } catch (error) {
            console.error('更新计划任务状态失败:', error);
        }
    });
    
    // 添加删除按钮事件
    const deleteBtn = li.querySelector('.plan-task-delete');
    deleteBtn.addEventListener('click', async function() {
        li.classList.add('fade-in');
        li.style.transform = 'translateX(100px)';
        li.style.opacity = '0';
        
        // 等待动画完成后再删除
        setTimeout(async () => {
            li.remove();
            try {
                await studyDB.delete('planTasks', id);
            } catch (error) {
                console.error('删除计划任务失败:', error);
            }
        }, 300);
    });
    
    planTasks.appendChild(li);
}

generatePlanBtn.addEventListener('click', generatePlan);

// 拖拽排序功能
const sortableLists = document.querySelectorAll('.sortable-list');

function addDragEvents(item) {
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragover', dragOver);
    item.addEventListener('drop', drop);
}

let draggedItem = null;

function dragStart(event) {
    draggedItem = this;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', this.innerHTML);
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const target = event.target;
    if (target.classList.contains('sortable-item')) {
        const rect = target.getBoundingClientRect();
        const offset = event.clientY - rect.top;
        const middle = rect.height / 2;
        
        if (offset < middle) {
            target.parentNode.insertBefore(draggedItem, target);
        } else {
            target.parentNode.insertBefore(draggedItem, target.nextSibling);
        }
    }
}

function drop(event) {
    event.preventDefault();
}

sortableLists.forEach(list => {
    list.addEventListener('dragstart', dragStart);
    list.addEventListener('dragover', dragOver);
    list.addEventListener('drop', drop);
});

// 获取科目名称
function getSubjectName(subject) {
    const subjectMap = {
        'math': '数学',
        'english': '英语',
        'data-structure': '数据结构',
        'coa': '计算机组成原理',
        'os': '操作系统',
        'cn': '计算机网络',
        'other': '其他'
    };
    return subjectMap[subject] || subject;
}

// 显示动画反馈
function showAnimationFeedback(element, type) {
    element.classList.add(`feedback-${type}`);
}

// 计时学习功能
const timerSubject = document.getElementById('timer-subject');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const pauseTimerBtn = document.getElementById('pause-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const dailyStats = document.getElementById('daily-stats');

// 补录学习时长功能
const manualEntrySubject = document.getElementById('manual-entry-subject');
const manualEntryDate = document.getElementById('manual-entry-date');
const manualEntryHours = document.getElementById('manual-entry-hours');
const manualEntryMinutes = document.getElementById('manual-entry-minutes');
const addManualEntryBtn = document.getElementById('add-manual-entry');

let timerInterval = null;
let seconds = 0;
let isRunning = false;
let currentTimerSubject = 'other';
let startTime = null; // 记录开始时间

// 设置默认日期为今天
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
manualEntryDate.value = `${yyyy}-${mm}-${dd}`;

// 更新计时器显示
function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    timerDisplay.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 开始计时
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        currentTimerSubject = timerSubject.value;
        startTime = new Date(); // 记录开始时间
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        
        // 添加按钮动画效果
        startTimerBtn.classList.add('pulse');
        
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }
}

// 暂停计时
function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        
        // 移除按钮动画效果
        startTimerBtn.classList.remove('pulse');
        
        // 保存学习时间
        saveStudyTime(currentTimerSubject, 1);
        saveStudySession(currentTimerSubject, startTime, new Date()); // 保存学习时段
        updateDailyStats();
        
        showAnimationFeedback(pauseTimerBtn, 'success');
    }
}

// 重置计时
function resetTimer() {
    pauseTimer();
    seconds = 0;
    startTime = null;
    updateTimerDisplay();
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    
    // 移除按钮动画效果
    startTimerBtn.classList.remove('pulse');
    
    showAnimationFeedback(resetTimerBtn, 'success');
}

// 保存学习时间到数据库
async function saveStudyTime(subject, minutes) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const id = `${today}-${subject}`;
    
    try {
        // 检查是否存在今天的记录
        const studyData = await studyDB.getAll('studyTime');
        const todayRecord = studyData.find(record => record.id === id);
        
        if (todayRecord) {
            // 更新现有记录
            todayRecord.minutes += minutes;
            await studyDB.update('studyTime', todayRecord);
        } else {
            // 创建新记录
            await studyDB.add('studyTime', {
                id: id,
                date: today,
                subject: subject,
                minutes: minutes
            });
        }
    } catch (error) {
        console.error('保存学习时间失败:', error);
    }
}

// 保存学习时段到数据库
async function saveStudySession(subject, start, end) {
    try {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const date = start.toISOString().split('T')[0]; // YYYY-MM-DD
        
        await studyDB.add('studySessions', {
            id: id,
            date: date,
            subject: subject,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            duration: Math.floor((end - start) / 60000) // 持续时间（分钟）
        });
    } catch (error) {
        console.error('保存学习时段失败:', error);
    }
}

// 补录学习时长
async function addManualEntry() {
    const subject = manualEntrySubject.value;
    const date = manualEntryDate.value;
    const hours = parseInt(manualEntryHours.value) || 0;
    const minutes = parseInt(manualEntryMinutes.value) || 0;
    
    if (!date) {
        showAnimationFeedback(manualEntryDate, 'error');
        alert('请选择日期');
        return;
    }
    
    if (hours === 0 && minutes === 0) {
        showAnimationFeedback(manualEntryHours, 'error');
        alert('请输入学习时长');
        return;
    }
    
    const totalMinutes = hours * 60 + minutes;
    const id = `${date}-${subject}`;
    
    try {
        // 检查是否已存在该日期该科目的记录
        const studyData = await studyDB.getAll('studyTime');
        const existingRecord = studyData.find(record => record.id === id);
        
        if (existingRecord) {
            // 更新现有记录
            existingRecord.minutes += totalMinutes;
            await studyDB.update('studyTime', existingRecord);
        } else {
            // 创建新记录
            await studyDB.add('studyTime', {
                id: id,
                date: date,
                subject: subject,
                minutes: totalMinutes
            });
        }
        
        // 清空输入框
        manualEntryHours.value = '';
        manualEntryMinutes.value = '';
        
        // 更新今日学习统计（如果补录的是今天的数据）
        const today = new Date().toISOString().split('T')[0];
        if (date === today) {
            updateDailyStats();
        }
        
        showAnimationFeedback(addManualEntryBtn, 'success');
    } catch (error) {
        console.error('补录学习时长失败:', error);
        showAnimationFeedback(addManualEntryBtn, 'error');
        alert('补录学习时长失败，请重试');
    }
}

// 更新今日学习统计
async function updateDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const studyData = await studyDB.getAll('studyTime');
        const todayData = studyData.filter(record => record.date === today);
        
        dailyStats.innerHTML = '';
        
        if (todayData.length === 0) {
            dailyStats.innerHTML = '<p>今日暂无学习记录</p>';
            return;
        }
        
        todayData.forEach(record => {
            const subjectName = getSubjectName(record.subject);
            const statItem = document.createElement('div');
            statItem.className = 'timer-stats-item fade-in';
            statItem.innerHTML = `
                <span>${subjectName}:</span>
                <span>${record.minutes} 分钟</span>
            `;
            dailyStats.appendChild(statItem);
        });
    } catch (error) {
        console.error('更新学习统计失败:', error);
    }
}

// 获取科目中文名称
function getSubjectName(subject) {
    const subjectMap = {
        'math': '数学一',
        'english': '英语一',
        'politics': '政治',
        'data-structure': '数据结构',
        'coa': '计算机组成原理',
        'os': '操作系统',
        'cn': '计算机网络',
        'other': '其他'
    };
    return subjectMap[subject] || subject;
}

startTimerBtn.addEventListener('click', startTimer);
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);
addManualEntryBtn.addEventListener('click', addManualEntry);

// 错题本功能
const mistakeSubject = document.getElementById('mistake-subject');
const mistakeContent = document.getElementById('mistake-content');
const addMistakeBtn = document.getElementById('add-mistake');
const mistakesList = document.getElementById('mistakes-list');
const mistakeFilters = document.querySelectorAll('.mistake-filter');

// 图片上传相关元素
const mistakeImagesInput = document.getElementById('mistake-images');
const selectImagesBtn = document.getElementById('select-images-btn');
const clearImagesBtn = document.getElementById('clear-images-btn');
const imagePreviewContainer = document.getElementById('image-preview-container');
const noImageText = document.getElementById('no-image-text');

let currentMistakeFilter = 'all';
let selectedImages = []; // 存储选择的图片文件

// 图片上传事件处理
selectImagesBtn.addEventListener('click', function() {
    mistakeImagesInput.click();
});

mistakeImagesInput.addEventListener('change', function(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        handleImageSelection(files);
    }
});

// 处理图片选择
function handleImageSelection(files) {
    // 清除"暂无图片"文本
    if (noImageText) {
        noImageText.style.display = 'none';
    }
    
    files.forEach(file => {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件');
            return;
        }
        
        // 限制图片数量
        if (selectedImages.length >= 5) {
            alert('最多只能上传5张图片');
            return;
        }
        
        // 添加到选中图片列表
        selectedImages.push(file);
        
        // 创建预览元素
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="预览图片">
                <div class="remove-image" data-index="${selectedImages.length - 1}">×</div>
            `;
            
            imagePreviewContainer.appendChild(previewItem);
            
            // 添加删除事件
            const removeBtn = previewItem.querySelector('.remove-image');
            removeBtn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                selectedImages.splice(index, 1);
                previewItem.remove();
                
                // 重新索引
                updateImageIndices();
                
                // 如果没有图片了，显示提示文本
                if (selectedImages.length === 0 && noImageText) {
                    noImageText.style.display = 'block';
                }
            });
        };
        reader.readAsDataURL(file);
    });
    
    // 清空input值，以便可以重复选择相同文件
    mistakeImagesInput.value = '';
}

// 更新图片索引
function updateImageIndices() {
    const removeButtons = imagePreviewContainer.querySelectorAll('.remove-image');
    removeButtons.forEach((btn, index) => {
        btn.setAttribute('data-index', index);
    });
}

// 清空图片
clearImagesBtn.addEventListener('click', function() {
    selectedImages = [];
    imagePreviewContainer.innerHTML = '<p id="no-image-text">暂无图片</p>';
});

// 加载错题
async function loadMistakes() {
    try {
        const mistakes = await studyDB.getAll('mistakes');
        mistakes.forEach(mistake => {
            // 解析图片数据
            let images = [];
            if (mistake.images) {
                try {
                    images = JSON.parse(mistake.images);
                } catch (e) {
                    console.error('解析图片数据失败:', e);
                }
            }
            addMistakeToDOM(mistake.subject, mistake.content, mistake.date, images, mistake.id);
        });
        filterMistakes();
    } catch (error) {
        console.error('加载错题失败:', error);
    }
}

// 添加错题到DOM
function addMistakeToDOM(subject, content, date, images = [], id = Date.now().toString()) {
    const li = document.createElement('li');
    li.className = 'mistakes-item sortable-item fade-in';
    li.dataset.id = id;
    li.dataset.subject = subject;
    li.draggable = true;
    
    const subjectName = getSubjectName(subject);
    
    // 构建图片HTML
    let imagesHTML = '';
    if (images && images.length > 0) {
        imagesHTML = '<div class="mistakes-item-images">';
        images.forEach(imgData => {
            // 检查imgData是base64字符串还是对象
            if (typeof imgData === 'string') {
                imagesHTML += `<div class="mistake-image"><img src="${imgData}" alt="错题图片"></div>`;
            } else if (imgData && imgData.data) {
                imagesHTML += `<div class="mistake-image"><img src="${imgData.data}" alt="错题图片"></div>`;
            }
        });
        imagesHTML += '</div>';
    }
    
    li.innerHTML = `
        <div class="mistakes-item-header">
            <span class="mistake-subject">${subjectName}</span>
            <span class="mistake-date">${date}</span>
            <button class="delete-mistake">删除</button>
        </div>
        <div class="mistakes-item-content">${content.replace(/\n/g, '<br>')}</div>
        ${imagesHTML}
    `;
    
    // 添加拖拽事件
    addDragEvents(li);
    
    const deleteBtn = li.querySelector('.delete-mistake');
    deleteBtn.addEventListener('click', async function() {
        li.classList.add('fade-in');
        li.style.transform = 'translateX(100px)';
        li.style.opacity = '0';
        
        // 等待动画完成后再删除
        setTimeout(async () => {
            li.remove();
            try {
                await studyDB.delete('mistakes', id);
            } catch (error) {
                console.error('删除错题失败:', error);
            }
        }, 300);
    });
    
    mistakesList.appendChild(li);
}

// 添加新错题
async function addMistake() {
    const subject = mistakeSubject.value;
    const content = mistakeContent.value.trim();
    
    if (!content && selectedImages.length === 0) {
        showAnimationFeedback(mistakeContent, 'error');
        alert('请输入错题内容或选择图片');
        return;
    }
    
    const date = new Date().toLocaleString('zh-CN');
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // 处理图片数据
    const imageDataPromises = selectedImages.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve({
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                });
            };
            reader.readAsDataURL(file);
        });
    });
    
    try {
        const imageData = await Promise.all(imageDataPromises);
        
        await studyDB.add('mistakes', {
            id: id,
            subject: subject,
            content: content,
            date: date,
            images: JSON.stringify(imageData) // 将图片数据转为JSON字符串存储
        });
        
        addMistakeToDOM(subject, content, date, imageData, id);
        mistakeContent.value = '';
        
        // 清空已选择的图片
        selectedImages = [];
        imagePreviewContainer.innerHTML = '<p id="no-image-text">暂无图片</p>';
        
        showAnimationFeedback(addMistakeBtn, 'success');
    } catch (error) {
        console.error('添加错题失败:', error);
        alert('添加错题失败，请重试');
    }
}

// 过滤错题
function filterMistakes() {
    const mistakes = document.querySelectorAll('.mistakes-item');
    mistakes.forEach(mistake => {
        if (currentMistakeFilter === 'all' || mistake.dataset.subject === currentMistakeFilter) {
            mistake.style.display = 'block';
            mistake.classList.add('fade-in');
        } else {
            mistake.style.display = 'none';
        }
    });
}

addMistakeBtn.addEventListener('click', addMistake);

// 设置错题过滤器事件
mistakeFilters.forEach(button => {
    button.addEventListener('click', function() {
        mistakeFilters.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentMistakeFilter = this.dataset.filter;
        filterMistakes();
    });
});

// 学习报告功能
const reportType = document.getElementById('report-type');
const generateReportBtn = document.getElementById('generate-report');
const reportContent = document.getElementById('report-content');

// 生成学习报告
async function generateReport() {
    const type = reportType.value;
    try {
        const studyData = await studyDB.getAll('studyTime');
        const studySessions = await studyDB.getAll('studySessions'); // 获取学习时段数据
        const todos = await studyDB.getAll('todos');
        const dates = [...new Set(studyData.map(record => record.date))].sort();
        
        if (dates.length === 0) {
            reportContent.innerHTML = '<p>暂无学习数据生成报告</p>';
            return;
        }
        
        // 确定报告日期范围
        let startDate, endDate;
        const today = new Date();
        
        if (type === 'weekly') {
            // 本周
            const dayOfWeek = today.getDay();
            startDate = new Date(today);
            startDate.setDate(today.getDate() - dayOfWeek);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else {
            // 本月
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        
        // 格式化日期
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // 筛选日期范围内的数据
        const reportData = {};
        let totalStudyTime = 0;
        const subjectStudyTime = {};
        
        studyData.forEach(record => {
            if (record.date >= startDateStr && record.date <= endDateStr) {
                if (!reportData[record.date]) {
                    reportData[record.date] = {};
                }
                reportData[record.date][record.subject] = record.minutes;
                totalStudyTime += record.minutes;
                
                if (!subjectStudyTime[record.subject]) {
                    subjectStudyTime[record.subject] = 0;
                }
                subjectStudyTime[record.subject] += record.minutes;
            }
        });
        
        // 筛选日期范围内的学习时段数据
        const periodSessions = studySessions.filter(session => 
            session.date >= startDateStr && session.date <= endDateStr
        );
        
        // 计算学习天数
        const studyDays = Object.keys(reportData).length;
        
        // 获取待办任务数据
        const periodTodos = todos.filter(todo => {
            const todoDate = todo.created ? todo.created.split('T')[0] : null;
            return todoDate && todoDate >= startDateStr && todoDate <= endDateStr;
        });
        
        const completedTodos = periodTodos.filter(todo => todo.completed);
        
        // 生成报告HTML
        let reportHTML = `
            <div class="report-section fade-in">
                <h3>学习概况</h3>
                <div class="report-stats">
                    <div class="report-stat-card slide-in">
                        <div class="report-stat-value">${studyDays}</div>
                        <div class="report-stat-label">学习天数</div>
                    </div>
                    <div class="report-stat-card slide-in">
                        <div class="report-stat-value">${Math.round(totalStudyTime / 60)}</div>
                        <div class="report-stat-label">总时长(小时)</div>
                    </div>
                    <div class="report-stat-card slide-in">
                        <div class="report-stat-value">${periodTodos.length}</div>
                        <div class="report-stat-label">计划任务</div>
                    </div>
                    <div class="report-stat-card slide-in">
                        <div class="report-stat-value">${completedTodos.length}</div>
                        <div class="report-stat-label">完成任务</div>
                    </div>
                </div>
            </div>
            
            <div class="report-section fade-in">
                <h3>科目学习时长</h3>
        `;
        
        for (const subject in subjectStudyTime) {
            const subjectName = getSubjectName(subject);
            const hours = Math.round(subjectStudyTime[subject] / 60);
            reportHTML += `
                <div class="timer-stats-item slide-in">
                    <span>${subjectName}:</span>
                    <span>${hours} 小时</span>
                </div>
            `;
        }
        
        reportHTML += '</div>';
        
        // 学习时段分析
        if (periodSessions.length > 0) {
            reportHTML += `
                <div class="report-section fade-in">
                    <h3>学习时段分析</h3>
                    <div class="time-analysis">
                        ${generateTimeAnalysis(periodSessions)}
                    </div>
                </div>
            `;
        }
        
        // 学习效率分析
        const completionRate = periodTodos.length ? (completedTodos.length / periodTodos.length) : 0;
        let efficiencyAnalysis = '';
        
        if (completionRate >= 0.8) {
            efficiencyAnalysis = '学习效率很高，任务完成度良好，继续保持！';
        } else if (completionRate >= 0.6) {
            efficiencyAnalysis = '学习效率中等，建议适当调整学习计划，提高任务完成度。';
        } else {
            efficiencyAnalysis = '学习效率有待提高，建议制定更合理的学习计划并严格执行。';
        }
        
        reportHTML += `
            <div class="report-section fade-in">
                <h3>学习效率分析</h3>
                <p class="slide-in">${efficiencyAnalysis}</p>
                <p class="slide-in">本周共制定 ${periodTodos.length} 个学习任务，已完成 ${completedTodos.length} 个，任务完成率为 ${Math.round(completionRate * 100)}%。</p>
            </div>
        `;
        
        reportContent.innerHTML = reportHTML;
        showAnimationFeedback(generateReportBtn, 'success');
    } catch (error) {
        console.error('生成学习报告失败:', error);
        reportContent.innerHTML = '<p>生成报告失败，请重试</p>';
    }
}

// 生成学习时段分析
function generateTimeAnalysis(sessions) {
    // 按小时分组统计
    const hourStats = {};
    // 按科目和小时分组统计
    const subjectHourStats = {};
    
    sessions.forEach(session => {
        // 解析开始时间
        const startTime = new Date(session.startTime);
        const hour = startTime.getHours(); // 0-23
        
        // 统计每小时的学习次数
        if (!hourStats[hour]) {
            hourStats[hour] = 0;
        }
        hourStats[hour]++;
        
        // 统计每小时每科目的学习次数
        if (!subjectHourStats[session.subject]) {
            subjectHourStats[session.subject] = {};
        }
        if (!subjectHourStats[session.subject][hour]) {
            subjectHourStats[session.subject][hour] = 0;
        }
        subjectHourStats[session.subject][hour]++;
    });
    
    // 找出最常学习的时段
    let favoriteHour = -1;
    let maxCount = 0;
    for (const hour in hourStats) {
        if (hourStats[hour] > maxCount) {
            maxCount = hourStats[hour];
            favoriteHour = parseInt(hour);
        }
    }
    
    // 生成最喜爱学习时段的描述
    let favoriteHourText = '';
    if (favoriteHour !== -1) {
        const hourLabels = {
            0: '深夜', 1: '深夜', 2: '深夜', 3: '深夜', 4: '凌晨', 5: '凌晨',
            6: '早晨', 7: '早晨', 8: '上午', 9: '上午', 10: '上午', 11: '上午',
            12: '中午', 13: '下午', 14: '下午', 15: '下午', 16: '下午', 17: '下午',
            18: '傍晚', 19: '晚上', 20: '晚上', 21: '晚上', 22: '晚上', 23: '深夜'
        };
        
        favoriteHourText = `您最常在${hourLabels[favoriteHour]}(${favoriteHour}点)学习`;
    }
    
    // 按科目分析学习时段
    let subjectAnalysis = '';
    for (const subject in subjectHourStats) {
        const subjectName = getSubjectName(subject);
        let favoriteSubjectHour = -1;
        let maxSubjectCount = 0;
        
        for (const hour in subjectHourStats[subject]) {
            if (subjectHourStats[subject][hour] > maxSubjectCount) {
                maxSubjectCount = subjectHourStats[subject][hour];
                favoriteSubjectHour = parseInt(hour);
            }
        }
        
        if (favoriteSubjectHour !== -1) {
            subjectAnalysis += `<p>${subjectName}科目您最常在${favoriteSubjectHour}点学习</p>`;
        }
    }
    
    return `
        <p>${favoriteHourText}</p>
        <div class="subject-time-analysis">
            ${subjectAnalysis}
        </div>
    `;
}

generateReportBtn.addEventListener('click', generateReport);

// 科目进度跟踪功能
const subjectSelector = document.getElementById('subject-selector');
const progressInput = document.getElementById('progress-input');
const updateProgressBtn = document.getElementById('update-progress');

// 加载科目进度
async function loadSubjectProgress() {
    try {
        const progressData = await studyDB.getAll('subjectProgress');
        progressData.forEach(progress => {
            const fillElement = document.querySelector(`.progress-fill[data-subject="${progress.subject}"]`);
            const textElement = document.getElementById(`${progress.subject}-progress`);
            if (fillElement && textElement) {
                fillElement.style.width = `${progress.progress}%`;
                textElement.textContent = `${progress.progress}%`;
            }
        });
    } catch (error) {
        console.error('加载科目进度失败:', error);
    }
}

// 更新科目进度
async function updateSubjectProgress() {
    const subject = subjectSelector.value;
    const progress = parseInt(progressInput.value);
    
    if (isNaN(progress) || progress < 0 || progress > 100) {
        showAnimationFeedback(progressInput, 'error');
        alert('请输入0-100之间的数字');
        return;
    }
    
    // 更新UI
    const fillElement = document.querySelector(`.progress-fill[data-subject="${subject}"]`);
    const textElement = document.getElementById(`${subject}-progress`);
    fillElement.style.width = `${progress}%`;
    textElement.textContent = `${progress}%`;
    
    // 同时更新考试信息模块中的进度
    updateExamProgress();
    
    try {
        // 保存到数据库
        await studyDB.add('subjectProgress', {
            subject: subject,
            progress: progress
        });
        showAnimationFeedback(updateProgressBtn, 'success');
    } catch (error) {
        // 如果已存在则更新
        try {
            const progressData = await studyDB.getAll('subjectProgress');
            const existingProgress = progressData.find(p => p.subject === subject);
            if (existingProgress) {
                existingProgress.progress = progress;
                await studyDB.update('subjectProgress', existingProgress);
                showAnimationFeedback(updateProgressBtn, 'success');
            }
        } catch (updateError) {
            console.error('更新科目进度失败:', updateError);
        }
    }
    
    // 清空输入框
    progressInput.value = '';
}

updateProgressBtn.addEventListener('click', updateSubjectProgress);

// 学习统计图表功能
let studyChart = null;
let subjectPieChart = null; // 科目饼图

// 初始化学习统计图表
function initStudyChart() {
    const ctx = document.getElementById('studyChart').getContext('2d');
    const pieCtx = document.getElementById('subjectPieChart').getContext('2d');
    
    // 获取学习数据
    const studyData = getStudyData(30); // 默认获取最近30天的数据
    const pieData = getSubjectPieData(30); // 获取科目饼图数据
    
    // 初始化折线图
    studyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: studyData.labels,
            datasets: [{
                label: '学习时长 (小时)',
                data: studyData.data,
                borderColor: 'rgb(52, 152, 219)',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                tension: 0.1,
                fill: true,
                pointBackgroundColor: 'rgb(52, 152, 219)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '学习时长 (小时)',
                        color: '#2c3e50',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#7f8c8d'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#7f8c8d'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#2c3e50',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2c3e50',
                    bodyColor: '#34495e',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            }
        }
    });
    
    // 初始化科目饼图
    subjectPieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: pieData.labels,
            datasets: [{
                data: pieData.data,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(142, 68, 173, 0.8)',
                    'rgba(52, 73, 94, 0.8)'
                ],
                borderColor: [
                    'rgb(52, 152, 219)',
                    'rgb(46, 204, 113)',
                    'rgb(155, 89, 182)',
                    'rgb(241, 196, 15)',
                    'rgb(230, 126, 34)',
                    'rgb(231, 76, 60)',
                    'rgb(142, 68, 173)',
                    'rgb(52, 73, 94)'
                ],
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#2c3e50',
                        font: {
                            size: 13
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2c3e50',
                    bodyColor: '#34495e',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value}小时 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 获取学习数据（折线图）
async function getStudyData(days) {
    try {
        const studyData = await studyDB.getAll('studyTime');
        const today = new Date();
        const labels = [];
        const data = [];
        
        // 创建一个日期映射来存储每天的总学习时长
        const dailyData = {};
        
        // 计算日期范围
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            dailyData[dateStr] = 0;
        }
        
        // 汇总每天的学习时长
        studyData.forEach(record => {
            if (dailyData.hasOwnProperty(record.date)) {
                dailyData[record.date] += Math.round(record.minutes / 60); // 转换为小时
            }
        });
        
        // 将数据放入数组
        for (const date in dailyData) {
            data.push(dailyData[date]);
        }
        
        return { labels, data };
    } catch (error) {
        console.error('获取学习数据失败:', error);
        // 返回模拟数据作为后备
        const labels = [];
        const data = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            labels.push(`${month}/${day}`);
            const hours = Math.floor(Math.random() * 8) + 1;
            data.push(hours);
        }
        
        return { labels, data };
    }
}

// 获取科目学习时长数据（饼图）
async function getSubjectPieData(days) {
    try {
        const studyData = await studyDB.getAll('studyTime');
        const today = new Date();
        
        // 计算日期范围
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days + 1);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];
        
        // 科目映射
        const subjectMap = {
            'math': '数学一',
            'english': '英语一',
            'politics': '政治',
            'data-structure': '数据结构',
            'coa': '计算机组成原理',
            'os': '操作系统',
            'cn': '计算机网络',
            'other': '其他'
        };
        
        // 初始化科目数据
        const subjectData = {};
        Object.values(subjectMap).forEach(subject => {
            subjectData[subject] = 0;
        });
        
        // 汇总各科目的学习时长
        studyData.forEach(record => {
            if (record.date >= startDateStr && record.date <= endDateStr) {
                const subjectName = subjectMap[record.subject] || record.subject;
                subjectData[subjectName] += Math.round(record.minutes / 60); // 转换为小时
            }
        });
        
        // 过滤掉学习时长为0的科目
        const labels = [];
        const data = [];
        for (const subject in subjectData) {
            if (subjectData[subject] > 0) {
                labels.push(subject);
                data.push(subjectData[subject]);
            }
        }
        
        return { labels, data };
    } catch (error) {
        console.error('获取科目饼图数据失败:', error);
        // 返回模拟数据作为后备
        const subjects = ['数学一', '英语一', '政治', '数据结构', '计算机组成原理', '操作系统', '计算机网络', '其他'];
        const data = [];
        let total = 0;
        
        for (let i = 0; i < subjects.length; i++) {
            const hours = Math.floor(Math.random() * 20) + 5;
            data.push(hours);
            total += hours;
        }
        
        return { labels: subjects, data: data };
    }
}

// 更新学习统计图表
async function updateStudyChart() {
    const period = parseInt(document.getElementById('chart-period').value);
    const studyData = await getStudyData(period);
    
    studyChart.data.labels = studyData.labels;
    studyChart.data.datasets[0].data = studyData.data;
    studyChart.update();
}

// 更新科目饼图
async function updateSubjectPieChart() {
    const period = parseInt(document.getElementById('pie-chart-period').value);
    const pieData = await getSubjectPieData(period);
    
    subjectPieChart.data.labels = pieData.labels;
    subjectPieChart.data.datasets[0].data = pieData.data;
    subjectPieChart.update();
}

// 图表周期选择事件
document.getElementById('chart-period').addEventListener('change', updateStudyChart);
document.getElementById('pie-chart-period').addEventListener('change', updateSubjectPieChart);

// 提醒功能
const reminderText = document.getElementById('reminder-text');
const reminderDate = document.getElementById('reminder-date');
const reminderTime = document.getElementById('reminder-time');
const addReminderBtn = document.getElementById('add-reminder');
const reminderList = document.getElementById('reminder-list');

// 设置默认日期为今天
reminderDate.value = `${yyyy}-${mm}-${dd}`;

// 加载提醒
async function loadReminders() {
    try {
        const reminders = await studyDB.getAll('reminders');
        reminders.forEach(reminder => {
            addReminderToDOM(reminder.text, reminder.date, reminder.time, reminder.id);
        });
    } catch (error) {
        console.error('加载提醒失败:', error);
    }
}

// 添加提醒到DOM
function addReminderToDOM(text, date, time, id = Date.now().toString()) {
    const li = document.createElement('li');
    li.className = 'reminder-item sortable-item fade-in';
    li.dataset.id = id;
    li.draggable = true;
    
    li.innerHTML = `
        <span class="reminder-content">${text}</span>
        <span class="reminder-datetime">${date} ${time}</span>
        <button class="delete-reminder">删除</button>
    `;
    
    // 添加拖拽事件
    addDragEvents(li);
    
    const deleteBtn = li.querySelector('.delete-reminder');
    deleteBtn.addEventListener('click', async function() {
        li.classList.add('fade-in');
        li.style.transform = 'translateX(100px)';
        li.style.opacity = '0';
        
        // 等待动画完成后再删除
        setTimeout(async () => {
            li.remove();
            try {
                await studyDB.delete('reminders', id);
            } catch (error) {
                console.error('删除提醒失败:', error);
            }
        }, 300);
    });
    
    reminderList.appendChild(li);
}

// 添加新提醒
async function addReminder() {
    const text = reminderText.value.trim();
    const date = reminderDate.value;
    const time = reminderTime.value;
    
    if (!text) {
        showAnimationFeedback(reminderText, 'error');
        alert('请输入提醒内容');
        return;
    }
    
    if (!date) {
        showAnimationFeedback(reminderDate, 'error');
        alert('请选择提醒日期');
        return;
    }
    
    if (!time) {
        showAnimationFeedback(reminderTime, 'error');
        alert('请选择提醒时间');
        return;
    }
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    try {
        await studyDB.add('reminders', {
            id: id,
            text: text,
            date: date,
            time: time
        });
        addReminderToDOM(text, date, time, id);
        showAnimationFeedback(addReminderBtn, 'success');
        
        // 清空输入框（保留日期为今天）
        reminderText.value = '';
        reminderTime.value = '';
        reminderDate.value = `${yyyy}-${mm}-${dd}`;
    } catch (error) {
        console.error('添加提醒失败:', error);
        alert('添加提醒失败，请重试');
    }
}

addReminderBtn.addEventListener('click', addReminder);

// 待办事项功能
const todoSubject = document.getElementById('todo-subject');
const todoInput = document.getElementById('new-todo');
const todoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const dateFilterButtons = document.querySelectorAll('.date-filter-btn');
let currentFilter = 'all';
let currentDateFilter = 'all';

// 从数据库加载待办事项
async function loadTodos() {
    try {
        const todos = await studyDB.getAll('todos');
        todos.forEach(todo => {
            addTodoToDOM(todo.text, todo.completed, todo.subject, todo.id, todo.created);
        });
        filterTodos();
    } catch (error) {
        console.error('加载待办事项失败:', error);
    }
}

// 添加待办事项到DOM
function addTodoToDOM(text, completed = false, subject = 'other', id = Date.now().toString(), created = new Date().toISOString()) {
    const li = document.createElement('li');
    li.className = 'todo-item sortable-item fade-in';
    if (completed) {
        li.classList.add('completed');
    }
    li.dataset.id = id;
    li.dataset.subject = subject;
    li.dataset.created = created;
    li.draggable = true;
    
    // 根据科目获取标签文本和样式类
    const subjectInfo = getSubjectInfo(subject);
    
    li.innerHTML = `
        <span class="subject-tag ${subjectInfo.class}">${subjectInfo.text}</span>
        <input type="checkbox" ${completed ? 'checked' : ''}>
        <span>${text}</span>
        <button class="delete-btn">删除</button>
    `;
    
    // 添加拖拽事件
    addDragEvents(li);
    
    const checkbox = li.querySelector('input');
    const deleteBtn = li.querySelector('.delete-btn');
    const span = li.querySelector('span:not(.subject-tag)');
    
    checkbox.addEventListener('change', async function() {
        li.classList.toggle('completed', this.checked);
        try {
            const todos = await studyDB.getAll('todos');
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = this.checked;
                await studyDB.update('todos', todo);
            }
        } catch (error) {
            console.error('更新待办事项状态失败:', error);
        }
    });
    
    span.addEventListener('click', async function() {
        const newText = prompt('编辑任务:', span.textContent);
        if (newText !== null && newText.trim() !== '') {
            span.textContent = newText.trim();
            try {
                const todos = await studyDB.getAll('todos');
                const todo = todos.find(t => t.id === id);
                if (todo) {
                    todo.text = newText.trim();
                    await studyDB.update('todos', todo);
                }
            } catch (error) {
                console.error('更新待办事项内容失败:', error);
            }
        }
    });
    
    deleteBtn.addEventListener('click', async function() {
        li.classList.add('fade-in');
        li.style.transform = 'translateX(100px)';
        li.style.opacity = '0';
        
        // 等待动画完成后再删除
        setTimeout(async () => {
            li.remove();
            try {
                await studyDB.delete('todos', id);
            } catch (error) {
                console.error('删除待办事项失败:', error);
            }
        }, 300);
    });
    
    todoList.appendChild(li);
}

// 获取科目信息（标签文本和样式类）
function getSubjectInfo(subject) {
    const subjectMap = {
        'math': { text: '数学一', class: 'subject-math' },
        'english': { text: '英语一', class: 'subject-english' },
        'politics': { text: '政治', class: 'subject-politics' },
        'data-structure': { text: '数据结构', class: 'subject-data-structure' },
        'coa': { text: '计算机组成原理', class: 'subject-coa' },
        'os': { text: '操作系统', class: 'subject-os' },
        'cn': { text: '计算机网络', class: 'subject-cn' },
        'other': { text: '其他', class: 'subject-other' }
    };
    
    return subjectMap[subject] || subjectMap['other'];
}

// 添加新待办事项
todoButton.addEventListener('click', async function() {
    const text = todoInput.value.trim();
    const subject = todoSubject.value;
    
    if (text) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const created = new Date().toISOString();
        
        try {
            await studyDB.add('todos', {
                id: id,
                text: text,
                completed: false,
                subject: subject,
                created: created
            });
            addTodoToDOM(text, false, subject, id, created);
            todoInput.value = '';
            todoInput.focus();
            filterTodos();
            showAnimationFeedback(todoButton, 'success');
        } catch (error) {
            console.error('添加待办事项失败:', error);
            alert('添加待办事项失败，请重试');
        }
    } else {
        showAnimationFeedback(todoInput, 'error');
    }
});

todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        todoButton.click();
    }
});

// 过滤待办事项
function filterTodos() {
    const todos = document.querySelectorAll('.todo-item');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 本周开始（周日）
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // 本月开始
    
    todos.forEach(todo => {
        const showBySubject = (currentFilter === 'all' || todo.dataset.subject === currentFilter);
        let showByDate = false;
        
        // 检查日期过滤条件
        if (currentDateFilter === 'all') {
            showByDate = true;
        } else {
            const created = new Date(todo.dataset.created);
            const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
            
            switch (currentDateFilter) {
                case 'today':
                    showByDate = createdDate.getTime() === today.getTime();
                    break;
                case 'week':
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    showByDate = createdDate >= weekStart && createdDate <= weekEnd;
                    break;
                case 'month':
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    showByDate = createdDate >= monthStart && createdDate <= monthEnd;
                    break;
            }
        }
        
        if (showBySubject && showByDate) {
            todo.style.display = 'flex';
            todo.classList.add('fade-in');
        } else {
            todo.style.display = 'none';
        }
    });
}

// 设置过滤器按钮事件
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 更新活动按钮
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // 设置当前过滤器并过滤待办事项
        currentFilter = this.dataset.filter;
        filterTodos();
    });
});

// 设置日期过滤器按钮事件
dateFilterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 更新活动按钮
        dateFilterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // 设置当前日期过滤器并过滤待办事项
        currentDateFilter = this.dataset.dateFilter;
        filterTodos();
    });
});

// 复盘功能
const reviewType = document.getElementById('review-type');
const reviewDateInput = document.getElementById('review-date');
const saveReviewBtn = document.getElementById('save-review');
const reviewInput = document.getElementById('review-input');
const reviewHistory = document.getElementById('review-history');
const showCalendarBtn = document.getElementById('show-calendar');
const calendarView = document.getElementById('calendar-view');
const calendarReviewType = document.getElementById('calendar-review-type');

// 设置默认复盘日期为今天
reviewDateInput.value = `${yyyy}-${mm}-${dd}`;

// 从数据库加载复盘记录
async function loadReviews() {
    try {
        const reviews = await studyDB.getAll('reviews');
        // 显示最近的5条记录
        const recentReviews = reviews.slice(0, 5);
        reviewHistory.innerHTML = '';
        recentReviews.forEach(review => {
            addReviewToDOM(review.type, review.date, review.content);
        });
    } catch (error) {
        console.error('加载复盘记录失败:', error);
    }
}

// 保存复盘到数据库
async function saveReview() {
    const type = reviewType.value;
    const date = reviewDateInput.value;
    const content = reviewInput.value.trim();
    
    if (!content) {
        showAnimationFeedback(reviewInput, 'error');
        alert('请输入复盘内容');
        return;
    }
    
    if (!date) {
        showAnimationFeedback(reviewDateInput, 'error');
        alert('请选择复盘日期');
        return;
    }
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    try {
        await studyDB.add('reviews', {
            id: id,
            type: type,
            date: date,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        // 更新显示
        addReviewToDOM(type, date, content);
        reviewInput.value = '';
        showAnimationFeedback(saveReviewBtn, 'success');
    } catch (error) {
        console.error('保存复盘记录失败:', error);
        alert('保存复盘记录失败，请重试');
    }
}

// 添加复盘记录到DOM
function addReviewToDOM(type, date, content) {
    const div = document.createElement('div');
    div.className = 'review-entry fade-in';
    
    // 根据类型显示中文标签
    let typeText = '';
    switch(type) {
        case 'daily':
            typeText = '日复盘';
            break;
        case 'weekly':
            typeText = '周复盘';
            break;
        case 'monthly':
            typeText = '月复盘';
            break;
    }
    
    div.innerHTML = `
        <div class="review-date">
            <span class="review-type">${typeText}</span>
            ${date}
        </div>
        <div class="review-content">${content.replace(/\n/g, '<br>')}</div>
    `;
    reviewHistory.prepend(div);
}

saveReviewBtn.addEventListener('click', saveReview);

// 日历功能
let currentCalendarDate = new Date();

// 显示日历视图
showCalendarBtn.addEventListener('click', function() {
    calendarView.classList.toggle('hidden');
    if (!calendarView.classList.contains('hidden')) {
        // 同步选择的复盘类型
        calendarReviewType.value = reviewType.value;
        renderCalendar(currentCalendarDate);
    }
});

// 渲染日历
async function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const type = calendarReviewType.value;
    
    // 设置日历标题
    document.getElementById('calendar-title').textContent = `${year}年${month + 1}月`;
    
    // 获取月份的第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取上个月的最后一天
    const prevLastDay = new Date(year, month, 0).getDate();
    
    // 获取第一天是星期几 (0=周日, 6=周六)
    const firstDayOfWeek = firstDay.getDay();
    
    // 获取最后一天是星期几
    const lastDayOfWeek = lastDay.getDay();
    
    // 生成日历天数
    const daysElement = document.getElementById('calendar-days');
    daysElement.innerHTML = '';
    
    // 添加上个月的日期
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = prevLastDay - i;
        daysElement.appendChild(dayElement);
    }
    
    // 添加当前月的日期
    const today = new Date();
    try {
        const reviews = await studyDB.getAll('reviews');
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day current-month';
            dayElement.textContent = i;
            
            // 标记今天
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // 根据类型检查是否有复盘记录
            let hasReview = false;
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            switch(type) {
                case 'daily':
                    hasReview = reviews.some(review => review.type === 'daily' && review.date === dateString);
                    break;
                case 'weekly':
                    // 检查该周是否有周复盘
                    hasReview = checkWeekHasReview(dateString, reviews);
                    if (hasReview) {
                        dayElement.classList.add('week-period');
                    }
                    break;
                case 'monthly':
                    // 检查该月是否有月复盘
                    hasReview = checkMonthHasReview(dateString, reviews);
                    if (hasReview) {
                        dayElement.classList.add('month-period');
                    }
                    break;
            }
            
            if (type === 'daily' && hasReview) {
                dayElement.classList.add('has-review');
            }
            
            // 添加点击事件
            dayElement.addEventListener('click', function() {
                showReviewsForDate(dateString, type, reviews);
            });
            
            daysElement.appendChild(dayElement);
        }
    } catch (error) {
        console.error('渲染日历失败:', error);
    }
    
    // 添加下个月的日期
    const remainingDays = 6 - lastDayOfWeek;
    for (let i = 1; i <= remainingDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = i;
        daysElement.appendChild(dayElement);
    }
}

// 检查指定日期所在周是否有周复盘
function checkWeekHasReview(dateString, reviews) {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    
    return reviews.some(review => 
        review.type === 'weekly' && 
        review.date >= startStr && 
        review.date <= endStr
    );
}

// 检查指定日期所在月是否有月复盘
function checkMonthHasReview(dateString, reviews) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    
    return reviews.some(review => 
        review.type === 'monthly' && 
        review.date >= startStr && 
        review.date <= endStr
    );
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 显示指定日期的复盘记录
function showReviewsForDate(dateString, type, reviews) {
    let dayReviews = [];
    
    switch(type) {
        case 'daily':
            dayReviews = reviews.filter(review => review.date === dateString && review.type === 'daily');
            break;
        case 'weekly':
            // 获取该日期所在周的开始和结束日期
            const date = new Date(dateString);
            const dayOfWeek = date.getDay();
            const startDate = new Date(date);
            startDate.setDate(date.getDate() - dayOfWeek);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            
            const startStr = formatDate(startDate);
            const endStr = formatDate(endDate);
            
            dayReviews = reviews.filter(review => 
                review.type === 'weekly' && 
                review.date >= startStr && 
                review.date <= endStr
            );
            break;
        case 'monthly':
            // 获取该日期所在月的开始和结束日期
            const monthDate = new Date(dateString);
            const monthYear = monthDate.getFullYear();
            const monthMonth = monthDate.getMonth();
            
            const monthStart = new Date(monthYear, monthMonth, 1);
            const monthEnd = new Date(monthYear, monthMonth + 1, 0);
            
            const monthStartStr = formatDate(monthStart);
            const monthEndStr = formatDate(monthEnd);
            
            dayReviews = reviews.filter(review => 
                review.type === 'monthly' && 
                review.date >= monthStartStr && 
                review.date <= monthEndStr
            );
            break;
    }
    
    const calendarReviews = document.getElementById('calendar-reviews');
    
    switch(type) {
        case 'daily':
            calendarReviews.innerHTML = `<div class="calendar-reviews-date">${dateString} 的日复盘记录</div>`;
            break;
        case 'weekly':
            const weekDate = new Date(dateString);
            const weekDay = weekDate.getDay();
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDay);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            calendarReviews.innerHTML = `<div class="calendar-reviews-date">${formatDate(weekStart)} 至 ${formatDate(weekEnd)} 的周复盘记录</div>`;
            break;
        case 'monthly':
            const monthDate = new Date(dateString);
            const monthYear = monthDate.getFullYear();
            const monthMonth = monthDate.getMonth() + 1;
            calendarReviews.innerHTML = `<div class="calendar-reviews-date">${monthYear}年${monthMonth}月 的月复盘记录</div>`;
            break;
    }
    
    if (dayReviews.length === 0) {
        calendarReviews.innerHTML += '<p>没有找到相关复盘记录</p>';
        return;
    }
    
    dayReviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-entry fade-in';
        
        let typeText = '';
        switch(review.type) {
            case 'daily':
                typeText = '日复盘';
                break;
            case 'weekly':
                typeText = '周复盘';
                break;
            case 'monthly':
                typeText = '月复盘';
                break;
        }
        
        reviewElement.innerHTML = `
            <div class="review-date">
                <span class="review-type">${typeText}</span>
                ${review.date}
            </div>
            <div class="review-content">${review.content.replace(/\n/g, '<br>')}</div>
        `;
        calendarReviews.appendChild(reviewElement);
    });
}

// 日历类型选择变化事件
calendarReviewType.addEventListener('change', function() {
    renderCalendar(currentCalendarDate);
});

// 上一个月
document.getElementById('prev-month').addEventListener('click', function() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(currentCalendarDate);
});

// 下一个月
document.getElementById('next-month').addEventListener('click', function() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(currentCalendarDate);
});

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl+S 保存复盘
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveReviewBtn.click();
    }
    
    // Ctrl+Enter 保存复盘
    if (e.ctrlKey && e.key === 'Enter' && document.activeElement === reviewInput) {
        saveReviewBtn.click();
    }
    
    // ESC 关闭日历
    if (e.key === 'Escape' && !calendarView.classList.contains('hidden')) {
        calendarView.classList.add('hidden');
    }
});

// 动画反馈函数
function showAnimationFeedback(element, type) {
    if (type === 'success') {
        element.classList.add('bounce-in');
        setTimeout(() => {
            element.classList.remove('bounce-in');
        }, 600);
    } else if (type === 'error') {
        element.style.borderColor = '#e74c3c';
        element.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
        setTimeout(() => {
            element.style.borderColor = '';
            element.style.boxShadow = '';
        }, 1000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 初始化数据库
        await initDB();
        
        // 初始化所有功能
        loadKnowledgePoints();
        loadPlanTasks();
        updateDailyStats();
        loadMistakes();
        loadReminders();
        loadTodos();
        loadReviews();
        loadSubjectProgress();
        
        // 添加11月11日的学习总结
        addNov11Review();
        
        // 初始化图表
        initStudyChart();
        
        // 初始化日历
        renderCalendar(currentMonth, currentYear, 'daily');
        
        // 定期更新今日学习统计，每5分钟更新一次
        setInterval(updateDailyStats, 300000);
    } catch (error) {
        console.error('初始化失败:', error);
    }
});

// 添加11月11日的学习总结
async function addNov11Review() {
    try {
        // 检查是否已存在该日期的复盘记录
        const reviews = await studyDB.getAll('reviews');
        const exists = reviews.some(review => review.date === '2024-11-11');
        
        // 如果不存在，则添加
        if (!exists) {
            const nov11Review = {
                id: '2024-11-11-review-' + Date.now(),
                type: 'daily',
                date: '2024-11-11',
                content: `感觉目前学的有一些盲目和着急了，一味地加速数学一轮的复习，到后期反而学习效率下降而且不够专注，过于枯燥且缺少反馈的学习过程效果不佳，应该再多投入一些精力到技能学习和阅读上，上课也可以多投入一些，毕竟上课做其他事情效率不很高。

英语的复习时间太少了，对于作文这种较难的任务很难说服自己去专心复习

睡觉又开始有些变迟了，应该尽量早一些

代办事项应该写清楚，不要拖，也不要忘记重要事项

还是要说服自己多反思`,
                timestamp: new Date('2024-11-11').toISOString()
            };
            
            await studyDB.add('reviews', nov11Review);
        }
    } catch (error) {
        console.error('添加11月11日学习总结失败:', error);
    }
}
