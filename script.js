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
            trainingLog: []
        };
        localStorage.setItem('player', JSON.stringify(player));
    }
    return JSON.parse(localStorage.getItem('player'));
};

// 更新球员属性
const updatePlayer = (newValues) => {
    const player = initPlayer();
    
    // 更新属性
    for (const [key, value] of Object.entries(newValues)) {
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
        value: newValues.value
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
            <span>${log.date} - ${log.type}训练</span>
            <span>+${log.value}</span>
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
        '综合': '综合训练让所有属性均衡提升，球队整体实力增强！'
    };
    
    return highlights[trainingType] || '训练完成，属性全面提升！';
};

// 初始化系统
const initSystem = () => {
    renderPlayer();
    renderLog();
    generateReport();
    
    // 记录训练按钮
    document.getElementById('log-training').addEventListener('click', () => {
        const trainingType = document.getElementById('training-type').value;
        let value = 1;
        
        // 根据科目设置提升值
        if (trainingType === '英语') value = 3;
        else if (trainingType === '数学' || trainingType === '专业课') value = 2;
        
        // 更新系统
        updatePlayer({
            type: trainingType,
            value: value
        });
        
        // 重渲染
        renderPlayer();
        renderLog();
        generateReport();
        
        // 重置下拉菜单
        document.getElementById('training-type').value = '英语';
    });
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    initSystem();
    
    // 每天00:00重置（模拟，实际使用可忽略）
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        // 模拟每天重置（实际不需要，属性会持续累积）
        const player = initPlayer();
        player.lastUpdate = new Date().toISOString().split('T')[0];
        localStorage.setItem('player', JSON.stringify(player));
    }
});
