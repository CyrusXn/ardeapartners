/**
 * 多语言下拉选择器交互逻辑
 * 配合 language-dropdown.css 使用
 */

// 语言配置
const LANGUAGE_CONFIG = {
    'en': {
        name: 'English',
        flag: 'EN',
        nativeName: 'English'
    },
    'zh-CN': {
        name: '简体中文',
        flag: '中',
        nativeName: '简体中文'
    },
    'zh-TW': {
        name: '繁體中文',
        flag: '繁',
        nativeName: '繁體中文'
    }
};

// 初始化下拉框
function initLanguageDropdown() {
    const dropdownTrigger = document.querySelector('.language-dropdown-trigger');
    const dropdownMenu = document.querySelector('.language-dropdown-menu');

    if (!dropdownTrigger || !dropdownMenu) {
        return;
    }

    // 检查是否已经初始化过
    if (dropdownTrigger.hasAttribute('data-initialized')) {
        return;
    }

    // 标记为已初始化
    dropdownTrigger.setAttribute('data-initialized', 'true');

    // 点击触发器切换下拉菜单
    dropdownTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
    });

    // 点击选项时选择语言
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const langCode = this.getAttribute('data-lang');
            if (langCode) {
                selectLanguage(langCode);
                closeDropdown();
            }
        });
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', function(e) {
        if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
            closeDropdown();
        }
    });

    // ESC键关闭下拉菜单
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    // 初始化当前语言显示
    updateCurrentLanguageDisplay();
}

// 切换下拉菜单显示/隐藏
function toggleDropdown() {
    const dropdownMenu = document.querySelector('.language-dropdown-menu');

    if (dropdownMenu && dropdownMenu.classList.contains('show')) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

// 打开下拉菜单
function openDropdown() {
    const dropdownTrigger = document.querySelector('.language-dropdown-trigger');
    const dropdownMenu = document.querySelector('.language-dropdown-menu');
    
    dropdownTrigger.classList.add('active');
    dropdownMenu.classList.add('show');
    
    // 更新选项状态
    updateOptionsState();
}

// 关闭下拉菜单
function closeDropdown() {
    const dropdownTrigger = document.querySelector('.language-dropdown-trigger');
    const dropdownMenu = document.querySelector('.language-dropdown-menu');
    
    dropdownTrigger.classList.remove('active');
    dropdownMenu.classList.remove('show');
}

// 选择语言
function selectLanguage(langCode) {
    // 调用原有的语言切换函数
    if (typeof changeLanguage === 'function') {
        changeLanguage(langCode);
    } else {
        console.error('changeLanguage function not found');
    }
    
    // 更新显示
    updateCurrentLanguageDisplay(langCode);
    updateOptionsState(langCode);
}

// 更新当前语言显示
function updateCurrentLanguageDisplay(langCode) {
    if (!langCode) {
        // 获取当前语言
        langCode = getCurrentLanguage();
    }
    
    const currentLangElement = document.querySelector('.current-language');
    const langFlag = document.querySelector('.language-flag');
    const langName = document.querySelector('.current-language .language-name');
    
    if (currentLangElement && LANGUAGE_CONFIG[langCode]) {
        const config = LANGUAGE_CONFIG[langCode];
        
        if (langFlag) {
            langFlag.textContent = config.flag;
        }
        
        if (langName) {
            langName.textContent = config.name;
        }
    }
}

// 更新选项状态
function updateOptionsState(langCode) {
    if (!langCode) {
        langCode = getCurrentLanguage();
    }
    
    const options = document.querySelectorAll('.language-option');
    options.forEach(option => {
        const optionLang = option.getAttribute('data-lang');
        if (optionLang === langCode) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// 获取当前语言
function getCurrentLanguage() {
    // 优先从全局变量获取
    if (typeof currentLanguage !== 'undefined' && currentLanguage) {
        return currentLanguage;
    }
    
    // 从sessionStorage获取
    const sessionLang = sessionStorage.getItem('selectedLanguage');
    if (sessionLang) {
        return sessionLang;
    }
    
    // 从localStorage获取
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
        return savedLang;
    }
    
    // 从cookie获取
    const cookieMatch = document.cookie.match(/googtrans=\/[^\/]*\/([^;]*)/);
    if (cookieMatch && cookieMatch[1]) {
        return cookieMatch[1];
    }
    
    // 默认英文
    return 'en';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保其他脚本已加载
    setTimeout(initLanguageDropdown, 500);
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initLanguageDropdown, 500);
    });
} else {
    setTimeout(initLanguageDropdown, 500);
}

// 备用初始化 - 确保下拉框能正常工作
window.addEventListener('load', function() {
    setTimeout(function() {
        const trigger = document.querySelector('.language-dropdown-trigger');
        if (trigger && !trigger.hasAttribute('data-initialized')) {
            initLanguageDropdown();
        }
    }, 1000);
});
