// 增强版脚本 - 深度森林算法网站

document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动功能
    const links = document.querySelectorAll('nav a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 更新活动链接
                updateActiveLink(this);
            }
        });
    });
    
    // 滚动时更新活动链接
    window.addEventListener('scroll', function() {
        let current = '';
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        const activeLink = document.querySelector(`nav a[href="#${current}"]`);
        updateActiveLink(activeLink);
        
        // 更新进度条
        updateProgressBar();
        
        // 控制回到顶部按钮显示
        toggleBackToTop();
    });
    
    // 更新活动链接样式
    function updateActiveLink(activeLink) {
        // 移除所有活动状态
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        // 添加当前活动状态
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // 更新进度条
    function updateProgressBar() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById("progress-bar");
        if (progressBar) {
            progressBar.style.width = scrolled + "%";
        }
    }
    
    // 回到顶部按钮控制
    function toggleBackToTop() {
        const backToTopButton = document.querySelector('.back-to-top');
        if (backToTopButton) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }
    }
    
    // 回到顶部功能
    const backToTopElement = document.querySelector('.back-to-top');
    if (backToTopElement) {
        backToTopElement.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 可折叠详情区域功能
    const detailsSummaries = document.querySelectorAll('.details-summary');
    if (detailsSummaries.length > 0) {
        detailsSummaries.forEach(summary => {
            summary.addEventListener('click', function() {
                const content = this.nextElementSibling;
                if (content) {
                    const isOpen = content.style.display === 'block';
                    
                    // 关闭所有其他详情内容
                    document.querySelectorAll('.details-content').forEach(el => {
                        el.style.display = 'none';
                    });
                    
                    // 切换当前详情内容
                    if (isOpen) {
                        content.style.display = 'none';
                    } else {
                        content.style.display = 'block';
                    }
                }
            });
        });
    }
    
    // 为所有章节添加进入视口动画
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
    
    // 图表容器悬停效果
    const diagramContainers = document.querySelectorAll('.diagram-container');
    diagramContainers.forEach(container => {
        container.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
        });
        
        container.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.12)';
        });
    });
    
    // 技术详情框悬停效果
    const infoBoxes = document.querySelectorAll('.key-point, .comparison, .technical-detail');
    infoBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // 初始化进度条
    let progressBar = document.getElementById('progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        progressBar.className = 'progress-bar';
        document.body.appendChild(progressBar);
    }
    
    // 初始化回到顶部按钮
    let backToTop = document.querySelector('.back-to-top');
    if (!backToTop) {
        backToTop = document.createElement('div');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '↑';
        document.body.appendChild(backToTop);
    }
    
    // 为创新改进部分添加折叠功能
    const innovationHeadings = document.querySelectorAll('#innovations h5, #innovations h6, #pulse-innovations h5');
    innovationHeadings.forEach(heading => {
        // 为标题添加指示器图标
        const icon = document.createElement('i');
        icon.className = 'fas fa-chevron-down toggle-icon';
        icon.style.marginLeft = '10px';
        icon.style.fontSize = '0.8em';
        icon.style.transition = 'transform 0.3s ease';
        heading.appendChild(icon);
        
        heading.style.cursor = 'pointer';
        heading.style.display = 'flex';
        heading.style.alignItems = 'center';
        
        heading.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.toggle-icon');
            
            if (content) {
                if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });
    
    // 为创新改进部分的内容添加初始隐藏状态
    const innovationContents = document.querySelectorAll('#innovations .key-point, #innovations .comparison, #innovations ul, #pulse-innovations .key-point, #pulse-innovations .comparison, #pulse-innovations ul, #pulse-innovations ol, #pulse-innovations table');
    innovationContents.forEach(content => {
        content.style.display = 'none';
        content.style.marginLeft = '20px';
    });

    // 新的可折叠组件系统
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content) {
                content.classList.toggle('active');
            }
        });
    });
    
    // 图表点击放大功能
    const diagramContainersForZoom = document.querySelectorAll('.diagram-container');
    const diagramModal = document.getElementById('diagram-modal');
    const diagramModalBody = document.getElementById('diagram-modal-body');
    const diagramModalClose = document.querySelector('.diagram-modal-close');
    
    // 为每个图表容器添加点击事件
    if (diagramModal) {
        diagramContainersForZoom.forEach(container => {
            container.style.cursor = 'zoom-in';
            container.addEventListener('click', function() {
                // 克隆图表内容
                const diagramClone = this.cloneNode(true);
                
                // 移除标题元素（只保留图表）
                const titleElement = diagramClone.querySelector('h3');
                if (titleElement) {
                    titleElement.remove();
                }
                
                // 清空模态框内容
                diagramModalBody.innerHTML = '';
                
                // 添加克隆的图表到模态框
                diagramModalBody.appendChild(diagramClone);
                
                // 显示模态框
                diagramModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // 防止背景滚动
            });
        });
        
        // 关闭模态框
        if (diagramModalClose) {
            diagramModalClose.addEventListener('click', function() {
                diagramModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // 恢复背景滚动
            });
        }
        
        // 点击模态框背景关闭
        diagramModal.addEventListener('click', function(e) {
            if (e.target === diagramModal) {
                diagramModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // 恢复背景滚动
            }
        });
    }
});

// 页面加载完成后初始化一些特效
window.addEventListener('load', function() {
    console.log('深度森林算法增强版页面已完全加载');
});