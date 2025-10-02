// 初始化球员属性
const initPlayer = () => {
    if (!localStorage.getItem('player')) {
        const player = {
            shot: 50,        // 射门（英语）
            dribble: 50,     // 盘带（数学）
            defense: 50,     // 防守（政治）
            speed: 50,       // 速度（解题）
            stamina: 50,     // 体能（知识）
            leadership: 50,  // 领导力（整合）
            lastUpdate: new Date().toISOString().split('T')[0],
            trainingLog: [],
            weeklyReview: null
        };
        localStorage.setItem('player', JSON.stringify(player));
    }
    return JSON.parse(localStorage.getItem('player'));
};

// 计算当前阶段
const calculateStage = (player) => {
    const avg = (player.shot + player.dribble + player.defense + player.speed + player.stamina + player.leadership) / 6;
    
    if (avg >= 90) return "国家队";
    if (avg >= 80) return "一线队";
    if (avg >= 65) return "预备队";
    return "青训营";
};

// 更新球员属性
const updatePlayer = (newValues) => {
    const player = initPlayer();
    
    // 确定基础提升值
    let baseValue = 1;
    switch (newValues.type) {
        case '英语': baseValue = 3; break;
        case '数学': baseValue = 2; break;
        case '政治': baseValue = 2; break;
        case '专业课': baseValue = 2; break;
        case '综合': baseValue = 1; break;
        case '知识体系构建': baseValue = 2; break;
        case '错题分析': baseValue = 2; break;
    }

    // 复习轮次系数
    let roundFactor = 1;
    switch (newValues.round) {
        case '第一轮': roundFactor = 1; break;
        case '第二轮': roundFactor = 1.5; break;
        case '第三轮': roundFactor = 2; break;
    }

    // 学习状态系数
    let stateFactor = 1;
    switch (newValues.state) {
        case '专注高效': stateFactor = 1.5; break;
        case '一般': stateFactor = 1; break;
        case '分心': stateFactor = 0.5; break;
        case '疲惫': stateFactor = 0; break;
    }

    // 计算最终提升值
    let value = Math.round(baseValue * roundFactor * stateFactor);
    value = Math.min(value, 10); // 最大提升10
    value = Math.max(value, 0);   // 最小0

    // 更新属性
    for (const [key, val] of Object.entries(newValues)) {
        if (key === 'type' || key === 'round' || key === 'state') continue;
        player[key] += value;
    }
    
    // 记录训练日志
    const today = new Date().toISOString().split('T')[0];
    if (today !== player.lastUpdate) {
        player.lastUpdate = today;
        player.trainingLog = [];
    }
    
    // 添加到日志
    player.trainingLog.push({
        date: today,
        type: newValues.type,
        round: newValues.round,
        state: newValues.state,
        value: value
    });
    
    localStorage.setItem('player', JSON.stringify(player));
    return player;
};

// 渲染球员状态
const renderPlayer = () => {
    const player = initPlayer();
    
    // 更新进度条
    const updateProgressBar = (id, value) => {
        const progress = document.getElementById(id);
        progress.style.width = `${value}%`;
        document.getElementById(`${id}-value`).textContent = value;
    };
    
    updateProgressBar('shot', player.shot);
    updateProgressBar('dribble', player.dribble);
    updateProgressBar('defense', player.defense);
    updateProgressBar('speed', player.speed);
    updateProgressBar('stamina', player.stamina);
    updateProgressBar('leadership', player.leadership);
    
    // 更新阶段
    document.getElementById('current-stage').textContent = calculateStage(player);
};

// 渲染训练日志
const renderLog = () => {
    const player = initPlayer();
    const logContainer = document.getElementById('log-history');
    logContainer.innerHTML = '';
    
    if (player.trainingLog.length === 0) {
        logContainer.innerHTML = '<p>暂无训练记录</p>';
        return;
    }
    
    player.trainingLog.forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.innerHTML = `
            <span>${log.date} - ${log.type}训练 (${log.round})</span>
            <span>+${log.value}（${log.state}）</span>
        `;
        logContainer.appendChild(logItem);
    });
};

// 生成进步报告
const generateReport = () => {
    const player = initPlayer();
    
    // 计算进步
    const today = new Date().toISOString().split('T')[0];
    const todayLog = player.trainingLog.find(log => log.date === today);
    
    if (!todayLog) {
        document.getElementById('report-content').innerHTML = 
            '<p>今天还没有进行训练哦！</p>';
        return;
    }
    
    // 生成报告内容
    const reportContent = `
        <p>🏆 今日进步报告（${today}）</p>
        <p>【${todayLog.type}】训练提升${todayLog.value}点！</p>
        <p>当前属性：</p>
        <ul>
            <li>射门（英语）: ${player.shot}</li>
            <li>盘带（数学）: ${player.dribble}</li>
            <li>防守（政治）: ${player.defense}</li>
        </ul>
        <p>⚽ 今日亮点：${getTodayHighlight(todayLog.type)}</p>
        <p>🎯 今日阶段：${calculateStage(player)}</p>
    `;
    
    document.getElementById('report-content').innerHTML = reportContent;
};

// 今日亮点提示
const getTodayHighlight = (trainingType) => {
    const highlights = {
        '英语': '英语阅读训练让射门能力提升，今天是英语突破的关键日！',
        '数学': '数学专项训练让盘带能力提升，解题速度正在加快！',
        '政治': '政治知识点梳理让防守能力提升，知识体系更牢固了！',
        '专业课': '专业课深度训练让领导力提升，知识整合能力增强！',
        '综合': '综合训练让所有属性均衡提升，球队整体实力增强！',
        '知识体系构建': '知识体系构建训练让领导力提升，知识脉络更加清晰！',
        '错题分析': '错题分析训练让防守能力提升，重点难点一网打尽！'
    };
    
    return highlights[trainingType] || '训练完成，属性全面提升！';
};

// 生成本周回顾
const generateWeeklyReview = () => {
    const player = initPlayer();
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - today.getDay()); // 星期一
    
    // 找出本周的训练日志
    const weekLog = player.trainingLog.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= today;
    });
    
    if (weekLog.length === 0) {
        document.getElementById('report-content').innerHTML = 
            '<p>⚠️ 本周没有训练记录，无法生成回顾</p>';
        return;
    }
    
    // 计算本周平均提升
    const totalValue = weekLog.reduce((sum, log) => sum + log.value, 0);
    const avgValue = totalValue / weekLog.length;
    
    // 计算本周主要提升科目
    const subjectCounts = {};
    weekLog.forEach(log => {
        subjectCounts[log.type] = (subjectCounts[log.type] || 0) + log.value;
    });
    
    const topSubject = Object.keys(subjectCounts).reduce((a, b) => 
        subjectCounts[a] > subjectCounts[b] ? a : b
    );
    
    // 计算本周弱项（提升最少的科目）
    const weakestSubject = Object.keys(subjectCounts).reduce((a, b) => 
        subjectCounts[a] < subjectCounts[b] ? a : b
    );
    
    // 生成回顾内容
    const reviewContent = `
        <p>🏆 本周回顾（${weekStart.toLocaleDateString('zh-CN')} 至 ${today.toLocaleDateString('zh-CN')}）</p>
        <p>训练天数: ${weekLog.length}天</p>
        <p>平均提升: ${avgValue.toFixed(1)}点/天</p>
        <p>主要提升科目: 【${topSubject}】（提升${subjectCounts[topSubject]}点）</p>
        <p>本周弱项: 【${weakestSubject}】（提升${subjectCounts[weakestSubject]}点）</p>
        <p>🎯 本周阶段: ${calculateStage(player)}</p>
        <p>📌 建议: 重点关注【${weakestSubject}】属性提升，进行针对性训练！</p>
    `;
    
    document.getElementById('report-content').innerHTML = reviewContent;
    
    // 保存本周回顾
    const weeklyReview = {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: today.toISOString().split('T')[0],
        summary: reviewContent,
        topSubject: topSubject,
        weakestSubject: weakestSubject
    };
    
    player.weeklyReview = weeklyReview;
    localStorage.setItem('player', JSON.stringify(player));
};

// 初始化系统
const initSystem = () => {
    renderPlayer();
    renderLog();
    generateReport();
    
    // 记录训练按钮
    document.getElementById('log-training').addEventListener('click', () => {
        const trainingType = document.getElementById('training-type').value;
        const round = document.getElementById('review-round').value;
        const state = document.getElementById('study-state').value;
        
        updatePlayer({
            type: trainingType,
            round: round,
            state: state
        });
        
        // 重渲染
        renderPlayer();
        renderLog();
        generateReport();
        
        // 重置下拉菜单
        document.getElementById('training-type').value = '英语';
        document.getElementById('review-round').value = '第一轮';
        document.getElementById('study-state').value = '专注高效';
    });
    
    // 生成周回顾按钮
    document.getElementById('generate-weekly-review').addEventListener('click', generateWeeklyReview);
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    initSystem();
    
    // 每天00:00重置（模拟，实际使用可忽略）
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        const player = initPlayer();
        player.lastUpdate = new Date().toISOString().split('T')[0];
        localStorage.setItem('player', JSON.stringify(player));
    }
});

// ... [原有代码保持不变] ...

// 新增：真题模拟系统
const simulateExam = (subject) => {
    const player = initPlayer();
    
    // 模拟考试难度系数
    const difficulty = {
        'math': 1.2,
        'english': 1.0,
        'politics': 0.8
    };
    
    // 生成模拟分数（基于当前属性）
    const baseScore = Math.floor(
        (player.shot + player.dribble + player.defense) / 3
    );
    
    const score = Math.min(100, Math.max(0, baseScore * difficulty[subject]));
    
    // 提升相关属性
    let attribute = 'shot';
    switch(subject) {
        case 'math': attribute = 'dribble'; break;
        case 'politics': attribute = 'defense'; break;
    }
    
    player[attribute] += Math.floor(score / 10);
    
    // 记录考试
    if (!player.exams) player.exams = [];
    player.exams.push({
        date: new Date().toISOString().split('T')[0],
        subject: subject,
        score: score,
        type: '模拟'
    });
    
    localStorage.setItem('player', JSON.stringify(player));
    
    // 显示结果
    document.getElementById('exam-result').innerHTML = `
        <p>✅ ${subject}模拟考试完成！分数：${score}/100</p>
        <p>属性提升：${attribute} +${Math.floor(score / 10)}</p>
    `;
    document.getElementById('exam-result').style.display = 'block';
    
    // 更新状态
    renderPlayer();
    generateReport();
};

// 新增：知识点记忆周期提醒
const setupMemoryReminders = () => {
    const player = initPlayer();
    
    // 模拟知识点记忆周期（实际应用中可从数据库获取）
    const memoryItems = [
        {name: "微积分基本定理", cycle: 3, lastReview: "2023-10-01"},
        {name: "三角函数公式", cycle: 5, lastReview: "2023-09-28"},
        {name: "专业课核心概念", cycle: 7, lastReview: "2023-09-25"}
    ];
    
    // 计算下次复习时间
    const today = new Date();
    const reminderItems = [];
    
    memoryItems.forEach(item => {
        const lastReview = new Date(item.lastReview);
        const daysSince = Math.floor((today - lastReview) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= item.cycle) {
            reminderItems.push(item);
        }
    });
    
    // 更新界面
    const reminderText = reminderItems.length > 0 
        ? reminderItems.map(i => i.name).join("、") 
        : "无";
    
    document.getElementById('reminder-text').textContent = reminderText;
    
    if (reminderItems.length > 0) {
        document.getElementById('next-review').textContent = 
            `明天 (${new Date(new Date().getTime() + 24*60*60*1000).toLocaleDateString('zh-CN')})`;
    } else {
        document.getElementById('next-review').textContent = "今天";
    }
};

// 新增：个性化学习建议
const generatePersonalizedSuggestion = () => {
    const player = initPlayer();
    
    // 检查错题分析
    if (!player.mistakes || player.mistakes.length === 0) {
        document.getElementById('personalized-suggestion').innerHTML = 
            '<p>系统建议：请继续进行常规训练，保持学习节奏</p>';
        return;
    }
    
    // 分析错题类型
    const typeCount = {};
    player.mistakes.forEach(mistake => {
        typeCount[mistake.type] = (typeCount[mistake.type] || 0) + 1;
    });
    
    // 找出最常见错题类型
    const mostCommonType = Object.keys(typeCount).reduce((a, b) => 
        typeCount[a] > typeCount[b] ? a : b
    );
    
    // 根据错题类型生成建议
    let suggestion = "系统建议：";
    let attribute = 'leadership';
    
    switch(mostCommonType) {
        case '概念不清': 
            suggestion += "请重点提升【防守】属性，进行30分钟概念梳理训练";
            attribute = 'defense';
            break;
        case '计算错误': 
            suggestion += "请重点提升【盘带】属性，进行20分钟计算专项训练";
            attribute = 'dribble';
            break;
        case '知识体系缺失': 
            suggestion += "请重点提升【领导力】属性，进行1小时'知识体系构建'训练";
            attribute = 'leadership';
            break;
        case '粗心': 
            suggestion += "请重点提升【速度】属性，进行15分钟限时训练";
            attribute = 'speed';
            break;
        case '时间不够': 
            suggestion += "请重点提升【体能】属性，进行25分钟时间管理训练";
            attribute = 'stamina';
            break;
    }
    
    // 显示建议
    document.getElementById('personalized-suggestion').innerHTML = 
        `<p>${suggestion}</p>`;
    
    // 添加属性提升提示
    const suggestionElement = document.getElementById('personalized-suggestion');
    suggestionElement.style.background = 
        `linear-gradient(to right, #e3f2fd, #bbdefb)`;
    
    // 为建议添加提升值
    const suggestionText = suggestionElement.querySelector('p');
    suggestionText.textContent += `（预计提升${Math.floor(player[attribute]/10)}点）`;
};

// 新增：考研时间线规划
const setupExamTimeline = () => {
    const timeline = [
        {date: "2023-10-15", event: "全国硕士研究生招生考试报名开始"},
        {date: "2023-12-24", event: "初试"},
        {date: "2024-02-20", event: "初试成绩公布"},
        {date: "2024-03-15", event: "复试"},
        {date: "2024-05-01", event: "录取结果公布"}
    ];
    
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = timeline.filter(event => event.date >= today);
    
    // 显示最近事件
    if (upcomingEvents.length > 0) {
        const nextEvent = upcomingEvents[0];
        document.getElementById('exam-timeline').innerHTML = `
            <h3>考研时间线</h3>
            <p>最近重要事件：${nextEvent.event}（${nextEvent.date}）</p>
            <p>距离事件：${calculateDaysUntil(nextEvent.date)}天</p>
        `;
    }
};

// 计算距离事件的天数
const calculateDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 新增：学习能量系统
const setupEnergySystem = () => {
    const player = initPlayer();
    
    // 学习能量计算（基于学习状态和训练）
    const energy = Math.min(100, Math.floor(
        (player.shot + player.dribble + player.defense) / 3
    ));
    
    // 更新能量显示
    document.getElementById('energy-value').textContent = energy;
    
    // 更新能量条
    document.getElementById('energy-bar').style.width = `${energy}%`;
    
    // 根据能量提供激励
    let energyMessage = "学习能量充足！";
    if (energy < 30) energyMessage = "学习能量不足，需要休息！";
    else if (energy < 60) energyMessage = "学习能量中等，保持节奏！";
    
    document.getElementById('energy-message').textContent = energyMessage;
};

// 初始化系统（新增功能）
const initSystem = () => {
    // ... [原有初始化代码] ...
    
    // 初始化新增功能
    setupMemoryReminders();
    generatePersonalizedSuggestion();
    setupExamTimeline();
    setupEnergySystem();
    
    // 为真题模拟按钮添加事件
    document.getElementById('math-exam').addEventListener('click', () => simulateExam('math'));
    document.getElementById('english-exam').addEventListener('click', () => simulateExam('english'));
    document.getElementById('politics-exam').addEventListener('click', () => simulateExam('politics'));
    
    // 每天更新记忆提醒
    if (new Date().getDate() === 1) {
        setupMemoryReminders();
    }
};

// ... [原有代码保持不变] ...
