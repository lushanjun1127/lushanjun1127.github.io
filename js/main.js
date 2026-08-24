/**
 * 个人主页交互脚本
 * 功能：平滑滚动、键盘导航、可访问性增强
 */

(function() {
    'use strict';

    /**
     * DOM 元素缓存
     */
    const elements = {
        sidebar: null,
        main: null,
        socialLinks: [],
        mainLinks: []
    };

    /**
     * 初始化函数
     */
    function init() {
        cacheElements();
        setupKeyboardNavigation();
        setupSmoothScrolling();
        addFocusVisiblePolyfill();
        console.log('Personal homepage initialized');
    }

    /**
     * 缓存 DOM 元素
     */
    function cacheElements() {
        elements.sidebar = document.querySelector('.sidebar');
        elements.main = document.querySelector('.main');
        elements.socialLinks = Array.from(document.querySelectorAll('.sidebar__social-link'));
        elements.mainLinks = Array.from(document.querySelectorAll('.main__link'));
    }

    /**
     * 设置键盘导航增强
     */
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(event) {
            // ESC 键模糊焦点
            if (event.key === 'Escape') {
                document.activeElement.blur();
            }
        });

        // 为所有链接添加键盘事件监听
        const allLinks = [...elements.socialLinks, ...elements.mainLinks];
        allLinks.forEach(function(link) {
            link.addEventListener('focus', function() {
                this.setAttribute('tabindex', '0');
            });

            link.addEventListener('blur', function() {
                this.removeAttribute('data-focused');
            });
        });
    }

    /**
     * 设置平滑滚动行为
     */
    function setupSmoothScrolling() {
        if (elements.main) {
            elements.main.style.scrollBehavior = 'smooth';
        }

        if (elements.sidebar) {
            elements.sidebar.style.scrollBehavior = 'smooth';
        }
    }

    /**
     * :focus-visible polyfill
     * 为不支持 focus-visible 的浏览器提供降级方案
     */
    function addFocusVisiblePolyfill() {
        let hadKeyboardEvent = false;

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' || e.keyCode === 9) {
                hadKeyboardEvent = true;
            }
        });

        document.addEventListener('mousedown', function() {
            hadKeyboardEvent = false;
        });

        document.addEventListener('keyup', function(e) {
            if (e.key === 'Tab' || e.keyCode === 9) {
                setTimeout(function() {
                    hadKeyboardEvent = false;
                }, 100);
            }
        });

        // 为链接添加适当的焦点样式
        const allFocusableElements = document.querySelectorAll('a[href], button, input, [tabindex]');
        allFocusableElements.forEach(function(el) {
            el.addEventListener('focus', function() {
                if (hadKeyboardEvent) {
                    this.setAttribute('data-focus-visible', 'true');
                }
            });

            el.addEventListener('blur', function() {
                this.removeAttribute('data-focus-visible');
            });
        });
    }

    /**
     * 工具函数：检查元素是否在视口中
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * 工具函数：节流函数
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * 工具函数：防抖函数
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(this, args);
            }, wait);
        };
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露公共 API（如果需要）
    window.PersonalHomepage = {
        refresh: function() {
            cacheElements();
        },
        version: '1.0.0'
    };

})();
