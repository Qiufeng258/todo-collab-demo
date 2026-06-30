// ================================================================
// 工具函数：安全转义（郭桂林 评审建议，防止 XSS 攻击）
// ================================================================
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


// ================================================================
// 全局状态
// ================================================================
let todos = [];
let currentFilter = 'all';
let currentUser = null;


// ================================================================
// DOM 引用
// ================================================================
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalSpan = document.getElementById('totalCount');
const doneSpan = document.getElementById('doneCount');
const pendingSpan = document.getElementById('pendingCount');
const filterBtns = document.querySelectorAll('.filter-btn');


// ================================================================
// 核心渲染函数（王历程 开发）
// 采用 DocumentFragment 减少回流，优化渲染性能
// ================================================================
function render() {

    // ---- 1. 更新统计卡片（熊健 开发） ----
    const total = todos.length;
    const done = todos.filter(function(t) { return t.completed; }).length;
    const pending = total - done;
    totalSpan.textContent = total;
    doneSpan.textContent = done;
    pendingSpan.textContent = pending;


    // ---- 2. 筛选数据（郭桂林 开发） ----
    var filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(function(t) { return !t.completed; });
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(function(t) { return t.completed; });
    }

    // ============================================================
    // 郭桂林 优化：筛选结果为空时显示友好提示
    // ============================================================
    var emptyMessage = '';
    if (filteredTodos.length === 0 && todos.length > 0) {
        if (currentFilter === 'active') {
            emptyMessage = '🎯 太棒了！所有待办都已完成！';
        } else if (currentFilter === 'completed') {
            emptyMessage = '📝 还没有已完成的待办，加油！';
        }
    } else if (filteredTodos.length === 0 && todos.length === 0) {
        emptyMessage = '📋 暂无待办，添加一条吧！';
    }


    // ---- 3. 渲染列表（王历程 开发，使用 DocumentFragment） ----
    var fragment = document.createDocumentFragment();

    // 如果有空状态提示，显示提示信息
    if (emptyMessage) {
        var emptyLi = document.createElement('li');
        emptyLi.style.cssText = 'text-align:center; color:#999; font-size:16px; padding:40px 0; border: none; background: none; cursor: default;';
        emptyLi.textContent = emptyMessage;
        fragment.appendChild(emptyLi);
    } else {
        filteredTodos.forEach(function(todo) {
            var li = document.createElement('li');
            if (todo.completed) li.classList.add('done');
            li.dataset.id = todo.id;

            var textSpan = document.createElement('span');
            textSpan.textContent = escapeHtml(todo.text);

            var delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.className = 'del-btn';

            li.appendChild(textSpan);
            li.appendChild(delBtn);
            fragment.appendChild(li);
        });
    }

    todoList.innerHTML = '';
    todoList.appendChild(fragment);
}


// ================================================================
// 待办 CRUD 核心操作（王历程 开发）
// ================================================================

// 添加待办
function addTodo() {
    var text = todoInput.value.trim();
    if (!text) {
        alert('⚠️ 请输入待办内容！');
        return;
    }
    todos.push({
        id: Date.now(),
        text: text,
        completed: false
    });
    todoInput.value = '';
    render();
}


// ================================================================
// 事件委托：统一处理删除 & 切换完成状态（王历程 优化）
// ================================================================
todoList.addEventListener('click', function(e) {
    var li = e.target.closest('li');
    if (!li) return;
    var id = parseInt(li.dataset.id);
    var todo = todos.find(function(t) { return t.id === id; });
    if (!todo) return;

    // 点击删除按钮（王历程 增加二次确认）
    if (e.target.classList.contains('del-btn')) {
        // ============================================================
        // 王历程 优化：删除前增加二次确认，防止误删
        // ============================================================
        if (!confirm('⚠️ 确定要删除 "' + todo.text + '" 吗？')) {
            return;
        }
        todos = todos.filter(function(t) { return t.id !== id; });
        render();
        return;
    }

    // 切换完成状态
    todo.completed = !todo.completed;
    render();
});


// 绑定添加事件
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTodo();
});


// ================================================================
// 筛选功能（郭桂林 开发）
// ================================================================
filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        render();
    });
});


// ================================================================
// 登录功能（张缙涵 开发）
// 已根据郭桂林的评审意见修复 XSS 漏洞
// ================================================================
var loginModal = document.getElementById('loginModal');
var loginBtn = document.getElementById('loginBtn');
var closeLogin = document.getElementById('closeLogin');
var usernameInput = document.getElementById('username');
var pwdInput = document.getElementById('pwd');
var loginMsg = document.getElementById('loginMsg');
var userDisplay = document.getElementById('userDisplay');

function openLogin() {
    loginModal.style.display = 'block';
    loginMsg.textContent = '';
    usernameInput.value = '';
    pwdInput.value = '';
}

function handleLogin() {
    var user = escapeHtml(usernameInput.value.trim());
    var pwd = escapeHtml(pwdInput.value.trim());

    if (!user || !pwd) {
        loginMsg.textContent = '⚠️ 工号和密码不能为空！';
        return;
    }

    if (pwd === '123456') {
        currentUser = user;
        userDisplay.textContent = '👋 ' + user;
        // ============================================================
        // 张缙涵 优化：登录成功后增加欢迎弹窗
        // ============================================================
        alert('🎉 欢迎回来，' + user + '！');
        loginModal.style.display = 'none';
        loginMsg.textContent = '';
    } else {
        loginMsg.textContent = '❌ 密码错误，请重试（默认密码: 123456）';
    }
}

closeLogin.addEventListener('click', function() {
    loginModal.style.display = 'none';
});

loginBtn.addEventListener('click', handleLogin);

pwdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleLogin();
});


// ================================================================
// 初始化
// ================================================================
render();

window.openLogin = openLogin;

console.log('✅ 智能待办看板已启动！');
console.log('👥 小组成员：陈志豪（组长）、张缙涵、王历程、熊健、郭桂林');