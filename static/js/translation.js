/**
 * 多语言翻译功能 - 公共文件
 * 支持英文、中文简体、中文繁体
 * 使用谷歌翻译API，支持本地翻译备用方案
 */

// 翻译源配置
const TRANSLATION_SOURCES = [
    {
        name: 'google_cn',
        url: 'https://translate.google.cn/translate_a/element.js?cb=gtElInit&client=wt',
        timeout: 5000
    },
    {
        name: 'google_com',
        url: 'https://translate.google.com/translate_a/element.js?cb=gtElInit&client=wt',
        timeout: 5000
    }
];

// 全局变量
let googleTranslateLib = null;
let currentLanguage = 'en';
let currentTranslationSource = null;
let loadAttemptCount = 0;

// 简单的本地翻译备用方案
const LOCAL_TRANSLATIONS = {
    'zh-CN': {
        'About': '关于',
        'Culture': '企业文化',
        'Careers': '职业发展',
        'Deposit and Withdrawal': '存款和取款',
        'Strategic Advice. Trust & Partnership.': '战略建议。信任与合作伙伴关系。',
        'Our Locations': '我们的地址',
        'Contact Us': '联系我们',
        'Team': '团队',
        'Transactions': '交易',
        'Home': '首页',
        // 隐私政策页面翻译
        'Windsor Heritage Capital Privacy Notice': 'Windsor Heritage Capital 隐私声明',
        'Privacy Policy | Windsor Heritage Capital Partners': '隐私政策 | Windsor Heritage Capital Partners',
        'Privacy Notice': '隐私声明',
        'Last Updated': '最后更新',
        'What is Personal Information?': '什么是个人信息？',
        'Our Collection & Use of Personal Information': '我们对个人信息的收集和使用',
        'Our Disclosure of Personal Information': '我们对个人信息的披露',
        'Control Over Your Information': '对您信息的控制',
        'Data Retention': '数据保留',
        'Children\'s Personal Information': '儿童个人信息',
        'Links to Third-party Websites or Services': '第三方网站或服务链接',
        'Updates to This Privacy Notice': '隐私声明更新',
        'Contact Us': '联系我们'
    },
    'zh-TW': {
        'About': '關於',
        'Culture': '企業文化',
        'Careers': '職業發展',
        'Deposit and Withdrawal': '存款和提款',
        'Strategic Advice. Trust & Partnership.': '戰略建議。信任與合作夥伴關係。',
        'Our Locations': '我們的地址',
        'Contact Us': '聯繫我們',
        'Team': '團隊',
        'Transactions': '交易',
        'Home': '首頁',
        // 隐私政策页面翻译
        'Windsor Heritage Capital Privacy Notice': 'Windsor Heritage Capital 隱私聲明',
        'Privacy Policy | Windsor Heritage Capital Partners': '隱私政策 | Windsor Heritage Capital Partners',
        'Privacy Notice': '隱私聲明',
        'Last Updated': '最後更新',
        'What is Personal Information?': '什麼是個人信息？',
        'Our Collection & Use of Personal Information': '我們對個人信息的收集和使用',
        'Our Disclosure of Personal Information': '我們對個人信息的披露',
        'Control Over Your Information': '對您信息的控制',
        'Data Retention': '數據保留',
        'Children\'s Personal Information': '兒童個人信息',
        'Links to Third-party Websites or Services': '第三方網站或服務鏈接',
        'Updates to This Privacy Notice': '隱私聲明更新',
        'Contact Us': '聯繫我們'
    }
};

// 自定义翻译修正映射 - 用于修正谷歌翻译的错误
const TRANSLATION_CORRECTIONS = {
    'zh-CN': {
        // 将"遗产"替换为"传承"
        '遗产': '传承',
        '温莎遗产资本': '温莎传承资本',
        'Windsor 遗产 Capital': 'Windsor 传承 Capital',
        'Windsor遗产Capital': 'Windsor传承Capital',
        // 可能的其他变体
        '遗产资本': '传承资本',
        '遗产投资': '传承投资',
        '遗产管理': '传承管理'
    },
    'zh-TW': {
        // 繁体中文的对应修正
        '遺產': '傳承',
        '溫莎遺產資本': '溫莎傳承資本',
        'Windsor 遺產 Capital': 'Windsor 傳承 Capital',
        'Windsor遺產Capital': 'Windsor傳承Capital',
        // 可能的其他变体
        '遺產資本': '傳承資本',
        '遺產投資': '傳承投資',
        '遺產管理': '傳承管理'
    }
};

// 应用翻译修正 - 修正谷歌翻译的错误
function applyTranslationCorrections(langCode) {
    if (!TRANSLATION_CORRECTIONS[langCode]) return;

    const corrections = TRANSLATION_CORRECTIONS[langCode];

    // 遍历页面中的所有文本节点
    function walkTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            let hasChanges = false;

            // 应用所有修正规则
            for (const [wrong, correct] of Object.entries(corrections)) {
                if (text.includes(wrong)) {
                    text = text.replace(new RegExp(wrong, 'g'), correct);
                    hasChanges = true;
                }
            }

            // 如果有修改，更新文本内容
            if (hasChanges) {
                node.textContent = text;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 跳过script和style标签
            if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                // 递归处理子节点
                for (let child of node.childNodes) {
                    walkTextNodes(child);
                }
            }
        }
    }

    // 从body开始遍历所有文本节点
    if (document.body) {
        walkTextNodes(document.body);
    }

    // 同时处理title标签
    if (document.title) {
        let title = document.title;
        for (const [wrong, correct] of Object.entries(corrections)) {
            if (title.includes(wrong)) {
                title = title.replace(new RegExp(wrong, 'g'), correct);
            }
        }
        document.title = title;
    }

    // 处理meta标签中的内容
    const metaTags = document.querySelectorAll('meta[content]');
    metaTags.forEach(meta => {
        let content = meta.getAttribute('content');
        for (const [wrong, correct] of Object.entries(corrections)) {
            if (content && content.includes(wrong)) {
                content = content.replace(new RegExp(wrong, 'g'), correct);
                meta.setAttribute('content', content);
            }
        }
    });
}

// 动态加载翻译脚本
function loadTranslationScript() {
    if (loadAttemptCount >= TRANSLATION_SOURCES.length) {
        showTranslateError('Translation service is temporarily unavailable. Please check your network connection.');
        return;
    }

    const source = TRANSLATION_SOURCES[loadAttemptCount];

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = source.url;

    // 设置超时处理
    const timeout = setTimeout(() => {
        script.remove();
        loadAttemptCount++;
        loadTranslationScript();
    }, source.timeout);

    script.onload = () => {
        clearTimeout(timeout);
        currentTranslationSource = source;
    };

    script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        loadAttemptCount++;
        loadTranslationScript();
    };

    document.head.appendChild(script);
}

// 谷歌翻译初始化（新版API）
function gtElInit() {
    try {
        googleTranslateLib = new google.translate.TranslateService();
        
        // 标记翻译库已准备就绪
        window.googleTranslateReady = true;
        
        // 应用缓存的语言设置
        applyStoredLanguage();
        
    } catch (error) {
        // 使用本地翻译作为备用方案
        const savedLanguage = sessionStorage.getItem('selectedLanguage') || 'en';
        if (savedLanguage !== 'en') {
            applyLocalTranslation(savedLanguage);
            sessionStorage.setItem('usingLocalTranslation', 'true');
        }
        updateLanguageButtons(savedLanguage);
        showTranslateError();
    }
}

// 语言切换函数（新版实现）
function changeLanguage(langCode) {
    // 防止重复切换到相同语言
    if (currentLanguage === langCode) {
        return;
    }
    
    // 防止频繁切换
    if (window.languageChanging) {
        return;
    }
    window.languageChanging = true;
    
    try {
        // 更新按钮状态
        updateLanguageButtons(langCode);
        
        // 保存语言选择到sessionStorage和localStorage
        sessionStorage.setItem('selectedLanguage', langCode);
        localStorage.setItem('selectedLanguage', langCode);
        currentLanguage = langCode;
        
        // 如果是英文，清除翻译
        if (langCode === 'en') {
            // 清除所有翻译相关的设置
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            sessionStorage.removeItem('usingLocalTranslation');
            localStorage.removeItem('usingLocalTranslation');
            // 重置标志位
            window.languageChanging = false;
            window.location.reload();
            return;
        }
        
        // 检查翻译库是否已加载
        if (!googleTranslateLib) {
            // 使用本地翻译作为备用方案
            applyLocalTranslation(langCode);
            sessionStorage.setItem('usingLocalTranslation', 'true');
            localStorage.setItem('usingLocalTranslation', 'true');
            // 重置标志位
            window.languageChanging = false;
            return;
        }
        
        // 检查是否已经设置了翻译cookie
        const existingCookie = document.cookie.match(/googtrans=\/[^\/]*\/([^;]*)/);
        if (existingCookie && existingCookie[1] === langCode) {
            // 确保按钮状态正确
            updateLanguageButtons(langCode);
            window.languageChanging = false;
            return;
        }
        
        // 设置翻译cookie
        const translationPair = `/en/${langCode}`;
        document.cookie = `googtrans=${translationPair}; path=/; max-age=31536000`;
        
        // 执行翻译
        googleTranslateLib.translatePage('en', langCode, function(progress, done, error) {
            if (error) {
                showTranslateError();
                // 重置标志位
                window.languageChanging = false;
            } else if (done) {
                // 翻译完成后应用修正
                setTimeout(() => {
                    applyTranslationCorrections(langCode);
                }, 500); // 给翻译一点时间完成渲染

                // 翻译完成，重置标志位
                window.languageChanging = false;
            }
        });
        
    } catch (error) {
        showTranslateError();
        // 重置标志位
        window.languageChanging = false;
    }
}

// 更新语言按钮状态 - 兼容新的下拉框结构
function updateLanguageButtons(langCode) {
    // 兼容旧的按钮结构
    const buttons = document.querySelectorAll('.language-selector button');

    // 清除所有按钮的active状态
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 设置目标按钮为active
    const buttonId = `lang-${langCode.toLowerCase().replace('_', '-')}`;

    const targetBtn = document.getElementById(buttonId);
    if (targetBtn) {
        targetBtn.classList.add('active');
    } else {
        // 如果直接查找失败，尝试遍历按钮
        buttons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');

            if (onclick && onclick.includes(`'${langCode}'`)) {
                btn.classList.add('active');
            }
        });
    }

    // 兼容新的下拉框结构
    const dropdownOptions = document.querySelectorAll('.language-option');
    if (dropdownOptions.length > 0) {
        dropdownOptions.forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            if (optionLang === langCode) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // 更新下拉框显示的当前语言
        if (typeof updateCurrentLanguageDisplay === 'function') {
            updateCurrentLanguageDisplay(langCode);
        }
    }
}

// 显示翻译错误提示
function showTranslateError(message = 'Translation service temporarily unavailable. Please try again later.') {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
    `;
    errorMsg.textContent = message;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        if (errorMsg.parentNode) {
            errorMsg.parentNode.removeChild(errorMsg);
        }
    }, 5000);
}

// 本地翻译函数（备用方案）
function applyLocalTranslation(langCode) {
    if (!LOCAL_TRANSLATIONS[langCode]) return;
    
    const translations = LOCAL_TRANSLATIONS[langCode];
    
    // 翻译导航菜单
    document.querySelectorAll('.menu_nav-item').forEach(link => {
        const text = link.textContent.trim();
        if (translations[text]) {
            link.textContent = translations[text];
        }
    });
    
    // 翻译主标题
    const heroTitle = document.querySelector('.hero-home_title');
    if (heroTitle && translations[heroTitle.textContent.trim()]) {
        heroTitle.textContent = translations[heroTitle.textContent.trim()];
    }
    
    // 翻译页脚标题
    document.querySelectorAll('.text-size-large.is-footer_col').forEach(title => {
        const text = title.textContent.trim();
        if (translations[text]) {
            title.textContent = translations[text];
        }
    });
    
    // 翻译语言选择器按钮 - 跳过，保持原始语言标识
    // document.querySelectorAll('.language-selector button').forEach(btn => {
    //     const text = btn.textContent.trim();
    //     if (translations[text]) {
    //         btn.textContent = translations[text];
    //     }
    // });
    
    // 翻译客服按钮
    const customerServiceText = document.querySelector('.customer-service-text');
    if (customerServiceText) {
        const text = customerServiceText.textContent.trim();
        if (translations[text]) {
            customerServiceText.textContent = translations[text];
        }
    }
    
    // 翻译客服按钮的alt属性
    const customerServiceIcon = document.querySelector('.customer-service-icon');
    if (customerServiceIcon) {
        const altText = customerServiceIcon.getAttribute('alt');
        if (translations[altText]) {
            customerServiceIcon.setAttribute('alt', translations[altText]);
        }
    }
    
    // 显示备用翻译提示
    showLocalTranslationNotice(langCode);
}

// 显示本地翻译提示
function showLocalTranslationNotice(langCode) {
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 12px;
        max-width: 250px;
    `;
    
    const messages = {
        'zh-CN': '正在使用基础翻译模式',
        'zh-TW': '正在使用基礎翻譯模式'
    };
    
    notice.textContent = messages[langCode] || 'Using basic translation mode';
    document.body.appendChild(notice);
    
    setTimeout(() => {
        if (notice.parentNode) {
            notice.parentNode.removeChild(notice);
        }
    }, 3000);
}

// 检测浏览器语言
function detectBrowserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith('zh')) {
        if (userLang.includes('TW') || userLang.includes('HK') || userLang.includes('MO')) {
            return 'zh-TW';
        } else {
            return 'zh-CN';
        }
    }
    return 'en';
}

// 获取存储的语言设置，优先级：cookie > sessionStorage > localStorage > 默认英文
function getStoredLanguage() {
    // 从cookie中检查当前翻译状态
    const cookieMatch = document.cookie.match(/googtrans=\/[^\/]*\/([^;]*)/);
    if (cookieMatch && cookieMatch[1]) {
        return cookieMatch[1];
    }
    
    // 检查sessionStorage（跨页面保持）
    const sessionLang = sessionStorage.getItem('selectedLanguage');
    if (sessionLang) {
        return sessionLang;
    }
    
    // 检查localStorage（持久保存）
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
        return savedLang;
    }
    
    // 如果没有任何存储的语言设置，默认为英文
    // 不再根据浏览器语言自动检测，用户可以手动选择
    return 'en'; // 默认英文
}

// 应用存储的语言设置
function applyStoredLanguage() {
    const storedLang = getStoredLanguage();
    
    // 更新全局状态和缓存
    currentLanguage = storedLang;
    sessionStorage.setItem('selectedLanguage', storedLang);
    
    // 更新按钮状态
    updateLanguageButtons(storedLang);
    
    // 如果是英文，清除任何翻译
    if (storedLang === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        sessionStorage.removeItem('usingLocalTranslation');
        return;
    }
    
    // 先应用本地翻译作为即时备用方案
    applyLocalTranslation(storedLang);
    sessionStorage.setItem('usingLocalTranslation', 'true');
    
    // 检查Google翻译是否可用
    if (!googleTranslateLib) {
        return;
    }
    
    // 完全复制按钮切换的逻辑
    // 检查是否已经设置了翻译cookie
    const existingCookie = document.cookie.match(/googtrans=\/[^\/]*\/([^;]*)/);
    if (existingCookie && existingCookie[1] === storedLang) {
        // 不返回，继续执行翻译以确保效果
    }
    
    // 设置翻译cookie（和按钮切换完全一样）
    const translationPair = `/en/${storedLang}`;
    document.cookie = `googtrans=${translationPair}; path=/; max-age=31536000`;
    
    // 核心：执行翻译API（和按钮切换完全一样）
    setTimeout(() => {
        googleTranslateLib.translatePage('en', storedLang, function(progress, done, error) {
            if (error) {
                showTranslateError();
            } else if (done) {
                // 翻译完成后应用修正
                setTimeout(() => {
                    applyTranslationCorrections(storedLang);
                }, 500); // 给翻译一点时间完成渲染

                // 清除本地翻译标记，因为Google翻译已成功
                sessionStorage.removeItem('usingLocalTranslation');
            }
        });
    }, 500); // 给一点时间让cookie生效
}

// 初始化翻译功能
function initializeTranslation() {
    // 防止多次初始化
    if (window.translationInitialized) {
        return;
    }
    window.translationInitialized = true;
    
    // 立即获取并应用存储的语言设置
    const storedLang = getStoredLanguage();
    
    // 更新全局状态和缓存
    currentLanguage = storedLang;
    sessionStorage.setItem('selectedLanguage', storedLang);
    
    // 立即更新按钮状态
    updateLanguageButtons(storedLang);
    
    // 如果是非英文语言，立即应用本地翻译作为即时备用方案
    if (storedLang !== 'en') {
        // 立即应用本地翻译，不等待
        applyLocalTranslation(storedLang);
        sessionStorage.setItem('usingLocalTranslation', 'true');
        
        // 检查是否需要Google翻译
        const cookieMatch = document.cookie.match(/googtrans=\/[^\/]*\/([^;]*)/);
        if (cookieMatch && cookieMatch[1] === storedLang) {
            // 清除本地翻译标记，因为Google翻译可用
            sessionStorage.removeItem('usingLocalTranslation');
        }
    }
    
    // 异步启动Google翻译脚本加载
    loadTranslationScript();
}

// 网络连接检查
function checkNetworkAndRetry(callback) {
    if (navigator.onLine) {
        callback();
    } else {
        setTimeout(() => {
            if (navigator.onLine) {
                callback();
            }
        }, 2000);
    }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTranslation();
});

// 页面加载完成后添加网络状态监听
window.addEventListener('load', function() {
    window.addEventListener('online', function() {
        // Network connection restored
    });

    window.addEventListener('offline', function() {
        // Network connection lost
    });

    // 添加DOM变化监听器，用于处理动态内容的翻译修正
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            const currentLang = getStoredLanguage();
            if (currentLang !== 'en' && TRANSLATION_CORRECTIONS[currentLang]) {
                // 延迟执行修正，避免频繁触发
                clearTimeout(window.correctionTimeout);
                window.correctionTimeout = setTimeout(() => {
                    applyTranslationCorrections(currentLang);
                }, 1000);
            }
        });

        // 开始观察DOM变化
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
});

// 将主要函数暴露到全局作用域，供页面调用
window.changeLanguage = changeLanguage;
window.updateLanguageButtons = updateLanguageButtons;
window.gtElInit = gtElInit;