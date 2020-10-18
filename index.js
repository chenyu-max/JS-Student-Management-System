var tableData = [];

// 绑定事件函数
function bindEvent() {
    // 选中 .left-menu dl 下的 直接 dl标签 
    var menuDl = document.querySelector('.left-menu > dl');

    // 左侧菜单框的按钮
    menuDl.onclick = function (e) {
        // 判断当前点击元素是 dd 标签
        if (e.target.tagName === 'DD') {
            var siblings = getSiblings(e.target);
            changeStyle(siblings, 'active', e.target);
            // dataset.xx 可以 返回 dom 中 含有的属性 为 data-xx  的 属性值
            var id = e.target.dataset.id;
            var content = document.getElementById(id);
            var contentSiblings = getSiblings(content);
            changeStyle(contentSiblings, 'show-content', content);
        }
    }

    // 添加学生信息的按钮点击事件绑定
    var addSubmit = document.getElementById('add-form-btn');
    addSubmit.onclick = function (e) {
        e.preventDefault();
        // 阻止默认事件，阻止点击submit 的时候 页面刷新
        var form = document.getElementById('student-add-form');
        var data = getFormData(form);
        // 获取 添加学生信息中表单的数据

        // 进行规则校验
        var isValid = isValidForm(data);
        if (!isValid) {
            return false;
        }

        // 将表单中的信息 添加到字符串中  按照规定的格式拼接  之后通过ajax 传给渡一的接口
        var dataStr = "";
        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                dataStr += prop + '=' + data[prop] + '&';
            }
        }
        dataStr += 'appkey=chenyu_max_1598678618622';
        ajax('get', 'http://open.duyiedu.com/api/student/addStudent', dataStr, function (res) {
            if (res.status === 'success') {
                alert('新增成功')
                var studentListBtn = document.querySelector('.left-menu dl dd[data-id="student-list"]');
                studentListBtn.click();
                // 直接触发 studentListBtn 跳转到 学生信息页面
                getTableData();
                // 重新获取数据
            } else {
                alert(res.msg);
            }
        }, true);
    }

    // 编辑 和 删除 按钮的操作 运用事件冒泡，之所以如此做，是为了当 页面没有完全加载完的时候，点击 事件能够绑定上取
    var tableBody = document.getElementById('student-tbody');
    var dialog = document.querySelector('.dialog');
    tableBody.onclick = function (e) {
        if (!e.target.classList.contains('btn')) {
            return false;
        }
        // 点击的是 编辑 按钮
        if (e.target.classList.contains('edit')) {
            var index = e.target.dataset.index;
            var student = tableData[index];
            dialog.classList.add('show');
            dataReset(student);
        } else {
            // 点击的是删除按钮
            var index = e.target.dataset.index;
            var student = tableData[index];
            var isDel = confirm('确认删除学号为' + student.sNo + '的学生信息吗？');
            if (isDel) {
                ajax('get', 'http://open.duyiedu.com/api/student/delBySno', 'appkey=chenyu_max_1598678618622&sNo=' + student.sNo, function (res) {
                    if (res.status === 'success') {
                        alert('删除成功');
                        getTableData();
                    } else {
                        alert(res.msg);
                    }
                });
            }
        }
    }

    var editForm = document.getElementById('student-edit-form');
    var editSubmitBtn = document.getElementById('edit-form-btn');
    editSubmitBtn.onclick = function(e){
        e.preventDefault();
        var data = getFormData(editForm);
        // 进行规则校验
        var isValid = isValidForm(data);
        if (!isValid) {
            return false;
        }

        var dataStr = "";
        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                dataStr += prop + '=' + data[prop] + '&';
            }
        }
        dataStr += 'appkey=chenyu_max_1598678618622';
        ajax('get', 'http://open.duyiedu.com/api/student/updateStudent', dataStr, function (res) {
            if (res.status === 'success') {
                dialog.classList.remove('show');
                // window.location.reload();
                getTableData();
            }else {
                alert(res.msg);
            }
        }, true);
    }

    // 当编辑区域展示出来的时候，我们点击编辑区域以外的内容，编辑区域消失
    dialog.onclick = function(e) {
        if (e.target === this) {
            dialog.classList.remove('show');
        }
    }
}

// 查找兄弟元素节点
function getSiblings(node) {
    var children = node.parentNode.children;
    var result = [];
    for (var i = 0; i < children.length; i++) {
        if (children[i] != node) {
            result.push(children[i]);
        }
    }
    return result;
}

// 拿取表单中所有的数据
function getFormData(form) {
    return {
        name: form.name.value,
        sex: form.sex.value,
        email: form.email.value,
        sNo: form.sNo.value,
        birth: form.birth.value,
        phone: form.phone.value,
        address: form.address.value
    }
}

// 表单的规则校验
function isValidForm(data) {
    var errorObj = {
        name: ["请填写学生姓名"],
        sNo: ["请填写学生学号", "学号由4-16位的数字组成"],
        birth: ["请填写出生年份", "仅接收50岁以内的学生"],
        email: ["请填写邮箱", "邮箱格式不正确"],
        sex: [],
        phone: ["请填写手机号", "手机号格式不正确"],
        address: ["请填写住址"]
    };

    for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
            // 判断当前属性是否有值， 如果没有则报出异常
            if (!data[prop]) {
                alert(errorObj[prop][0]);
                return false;
            }
        }
    }

    // 4 - 16 位的 数字，以数字开头，以数字结尾
    var regSNo = /^\d{4,16}$/;
    if (!regSNo.test(data.sNo)) {
        alert(errorObj.sNo[1]);
        return false;
    }

    return true;
}

// 切换样式效果
function changeStyle(siblings, className, target) {
    for (var i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove(className);
    }
    target.classList.add(className);
}

// 获取表格数据
function getTableData() {
    ajax('GET', 'http://open.duyiedu.com/api/student/findAll', 'appkey=chenyu_max_1598678618622', function (res) {
        if (res.status === 'success') {
            tableData = res.data;
            renderTable(res.data);
        } else {
            alert(res.msg);
        }
    })
}

// 编辑表单的数据回填
function dataReset(data){
    var form = document.getElementById('student-edit-form');

    // 循环学生信息，判断在表单当中是否含有输入的位置，如果有的话，修改其值
    // form[name] 表示 form 结构中， name 属性的 属性 值 是 name 的 dom 结构
    for(var prop in data){
        if(form[prop]){
            form[prop].value = data[prop];
        }
    }
}

// 渲染表格信息
function renderTable(data) {
    var str = '';
    data.forEach(function (item, index) {
        str += `<tr>
            <td>${item.sNo}</td>
            <td>${item.name}</td>
            <td>${item.sex == 0 ? '男' : '女'}</td>
            <td>${item.email}</td>
            <td>${new Date().getFullYear() - item.birth}</td>
            <td>${item.phone}</td>
            <td>${item.address}</td>
            <td>
                <button class="btn edit" data-index=${index}>编辑</button>
                <button class="btn remove" data-index=${index}>删除</button>
            </td>
    </tr>`;
    });
    var tbody = document.getElementById('student-tbody');
    tbody.innerHTML = str;
}

bindEvent();
getTableData();


/**
 *
 * @param {String} method 请求方式  需要大写
 * @param {String} url    请求地址  协议（http）+ 域名+ 端口号 + 路径
 * @param {String} data   请求数据  key=value&key1=value1
 * @param {Function} cb     成功的回调函数
 * @param {Boolean} isAsync 是否异步 true
 */
function ajax(method, url, data, cb, isAsync) {
    console.log(data)
    // get   url + '?' + data
    // post
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    // xhr.readyState    1 - 4  监听是否有响应
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                cb(JSON.parse(xhr.responseText))
            }
        }
    }
    method = method.toUpperCase();
    if (method == 'GET') {
        xhr.open(method, url + '?' + data, isAsync);
        xhr.send();
    } else if (method == 'POST') {
        xhr.open(method, url, isAsync);
        // key=value&key1=valu1
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(data);
    }

}