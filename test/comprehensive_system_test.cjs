const fs = require('fs');
const path = require('path');

/**
 * 日常行为分管理系统 - 完整功能测试脚本
 * 
 * 本测试脚本将完整测试系统的所有功能模块：
 * 1. 用户认证系统（管理员、老师、学生登录）
 * 2. 管理员功能（学生管理、申请审核、老师管理、归档功能）
 * 3. 老师功能（提交申请、查看历史、查看学生、修改密码）
 * 4. 学生功能（查看分值、查看记录）
 * 5. 文件操作（Excel导入导出、归档下载）
 * 6. 权限控制测试
 * 7. 数据完整性测试
 */

class SystemTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = [];
        this.testStats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        };
          // 测试用的用户账号
        this.testUsers = {
            admin: { username: 'admin', password: 'admin123' },
            teacher1: { username: 'teacher1', password: 'teacher123' },
            teacher2: { username: 'Aruianhod', password: '123456' }, // 将在测试中创建
            student1: { username: '2024001001', password: '2024001001' }, // 将在测试中创建
            student2: { username: '2024001002', password: '2024001002' }  // 将在测试中创建
        };
        
        // 测试数据
        this.testData = {
            students: [
                { id: '2024001001', name: '张三', grade: '2024', class: '1' },
                { id: '2024001002', name: '李四', grade: '2024', class: '1' },
                { id: '2024001003', name: '王五', grade: '2024', class: '2' },
                { id: '2023001001', name: '赵六', grade: '2023', class: '1' },
                { id: '2023001002', name: '钱七', grade: '2023', class: '2' }
            ],
            teachers: [
                { username: 'test_teacher_001', name: '测试老师一' },
                { username: 'test_teacher_002', name: '测试老师二' }
            ]
        };
    }

    // 日志输出函数
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleString('zh-CN');
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    // 记录测试结果
    recordTest(testName, passed, details = '', duration = 0) {
        this.testStats.total++;
        if (passed) {
            this.testStats.passed++;
            this.log(`✅ PASS: ${testName} (${duration}ms)`, 'success');
        } else {
            this.testStats.failed++;
            this.log(`❌ FAIL: ${testName} - ${details}`, 'error');
        }
        
        this.testResults.push({
            name: testName,
            passed,
            details,
            duration,
            timestamp: new Date().toISOString()
        });
    }

    // HTTP请求工具函数
    async request(url, options = {}) {
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
        
        try {
            const response = await fetch(fullUrl, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (contentType && contentType.includes('application/vnd.openxmlformats')) {
                data = await response.blob();
            } else {
                data = await response.text();
            }
            
            return {
                status: response.status,
                ok: response.ok,
                data,
                headers: response.headers
            };
        } catch (error) {
            return {
                status: 0,
                ok: false,
                error: error.message
            };
        }
    }

    // ==================== 用户认证测试 ====================
    async testUserAuthentication() {
        this.log('\n🔐 开始用户认证测试...', 'info');
        
        // 测试管理员登录
        const adminLogin = await this.testLogin('管理员登录', this.testUsers.admin);
        
        // 测试老师登录
        const teacherLogin = await this.testLogin('老师登录', this.testUsers.teacher1);
        
        // 测试学生登录（先创建学生数据）
        await this.testCreateStudentData();
        const studentLogin = await this.testLogin('学生登录', this.testUsers.student1);
        
        // 测试错误登录
        await this.testInvalidLogin();
        
        return adminLogin && teacherLogin && studentLogin;
    }

    async testLogin(testName, user) {
        const startTime = Date.now();
        
        const response = await this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify(user)
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.token && response.data.userType;
        
        this.recordTest(testName, passed, 
            passed ? '' : `登录失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testInvalidLogin() {
        const startTime = Date.now();
        
        const response = await this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'invalid', password: 'invalid' })
        });
        
        const duration = Date.now() - startTime;
        const passed = !response.ok && response.status === 401;
        
        this.recordTest('无效用户登录拒绝', passed, 
            passed ? '' : '应该拒绝无效用户登录', 
            duration
        );
        
        return passed;
    }

    // ==================== 管理员功能测试 ====================
    async testAdminFunctions() {
        this.log('\n👑 开始管理员功能测试...', 'info');
        
        // 学生信息管理测试
        await this.testStudentManagement();
        
        // 分值修改测试
        await this.testScoreManagement();
        
        // 申请审核测试
        await this.testApplicationReview();
        
        // 老师账号管理测试
        await this.testTeacherManagement();
        
        // 年级班级选项测试
        await this.testClassOptions();
    }

    async testStudentManagement() {
        this.log('📚 测试学生信息管理...', 'info');
        
        // 测试学生导入
        await this.testStudentImport();
        
        // 测试学生列表查询
        await this.testStudentList();
        
        // 测试学生筛选
        await this.testStudentFilter();
        
        // 测试学生删除
        await this.testStudentDeletion();
    }

    async testStudentImport() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify({ students: this.testData.students })
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('导入成功');
        
        this.recordTest('学生信息导入', passed, 
            passed ? '' : `导入失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testStudentList() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/students');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data.students);
        
        this.recordTest('学生列表查询', passed, 
            passed ? '' : `查询失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testStudentFilter() {
        const startTime = Date.now();
        
        // 按年级筛选
        const response = await this.request('/api/admin/students?grade=2024');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data.students);
        
        this.recordTest('学生信息筛选', passed, 
            passed ? '' : `筛选失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        // 按班级筛选
        const classResponse = await this.request('/api/admin/students?grade=2024&class=1');
        const classPassed = classResponse.ok && Array.isArray(classResponse.data.students);
        
        this.recordTest('学生班级筛选', classPassed, 
            classPassed ? '' : `班级筛选失败: ${classResponse.data?.message || classResponse.error}`, 
            Date.now() - startTime
        );
        
        return passed && classPassed;
    }

    async testStudentDeletion() {
        const startTime = Date.now();
        
        // 先创建一个测试学生
        const testStudent = { id: '9999999999', name: '测试删除', grade: '2024', class: '99' };
        await this.request('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify({ students: [testStudent] })
        });
        
        // 删除测试学生
        const response = await this.request('/api/admin/students', {
            method: 'DELETE',
            body: JSON.stringify({ ids: [testStudent.id] })
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('删除成功');
        
        this.recordTest('学生信息删除', passed, 
            passed ? '' : `删除失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testScoreManagement() {
        this.log('📊 测试分值管理...', 'info');
        
        // 单个学生分值修改
        await this.testSingleScoreUpdate();
        
        // 批量分值修改
        await this.testBatchScoreUpdate();
        
        // 分值记录查询
        await this.testScoreRecords();
    }

    async testSingleScoreUpdate() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/score', {
            method: 'POST',
            body: JSON.stringify({
                student_id: '2024001001',
                delta: 5,
                reason: '测试分值修改',
                operator: 'admin'
            })
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('成功');
        
        this.recordTest('单个分值修改', passed, 
            passed ? '' : `修改失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testBatchScoreUpdate() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/score', {
            method: 'POST',
            body: JSON.stringify({
                student_id: ['2024001001', '2024001002'],
                delta: -2,
                reason: '测试批量分值修改',
                operator: 'admin'
            })
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('成功');
        
        this.recordTest('批量分值修改', passed, 
            passed ? '' : `修改失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testScoreRecords() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/score-records/2024001001');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data.records);
        
        this.recordTest('分值记录查询', passed, 
            passed ? '' : `查询失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testApplicationReview() {
        this.log('📋 测试申请审核...', 'info');
        
        // 先创建一个测试申请
        await this.createTestApplication();
        
        // 获取待审核申请
        await this.testGetPendingApplications();
        
        // 审核通过测试
        await this.testApproveApplication();
        
        // 审核驳回测试
        await this.testRejectApplication();
    }

    async createTestApplication() {
        const applicationData = {
            students: [{ id: '2024001001', name: '张三' }],
            delta: 3,
            reason: '测试申请审核',
            date: new Date().toISOString().slice(0, 10),
            teacher: 'teacher1'
        };
        
        return await this.request('/api/teacher/apply', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    async testGetPendingApplications() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/applications');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data.applications);
        
        this.recordTest('获取待审核申请', passed, 
            passed ? '' : `获取失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return response.data?.applications || [];
    }

    async testApproveApplication() {
        const applications = await this.testGetPendingApplications();
        
        if (applications.length === 0) {
            this.recordTest('审核通过测试', false, '没有待审核申请', 0);
            return false;
        }
        
        const startTime = Date.now();
        const appId = applications[0].id;
        
        const response = await this.request(`/api/admin/applications/${appId}/approve`, {
            method: 'POST'
        });
          const duration = Date.now() - startTime;
        const passed = response.ok && (
            response.data.message.includes('成功') || 
            response.data.message.includes('审核通过') ||
            response.data.message.includes('已完成')
        );
        
        this.recordTest('申请审核通过', passed, 
            passed ? response.data.message : `审核失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testRejectApplication() {
        // 创建新申请用于驳回测试
        await this.createTestApplication();
        const applications = await this.testGetPendingApplications();
        
        if (applications.length === 0) {
            this.recordTest('审核驳回测试', false, '没有待审核申请', 0);
            return false;
        }
        
        const startTime = Date.now();
        const appId = applications[0].id;
        
        const response = await this.request(`/api/admin/applications/${appId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason: '测试驳回原因' })
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('驳回');
        
        this.recordTest('申请审核驳回', passed, 
            passed ? '' : `驳回失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testTeacherManagement() {
        this.log('👨‍🏫 测试老师账号管理...', 'info');
        
        // 获取老师列表
        await this.testGetTeachers();
        
        // 创建老师账号
        await this.testCreateTeacher();
        
        // 删除老师账号
        await this.testDeleteTeacher();
    }

    async testGetTeachers() {
        const startTime = Date.now();
        
        const response = await this.request('/api/teachers');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data);
        
        this.recordTest('获取老师列表', passed, 
            passed ? '' : `获取失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return response.data || [];
    }

    async testCreateTeacher() {
        const startTime = Date.now();
        
        const teacherData = this.testData.teachers[0];
        const response = await this.request('/api/teachers', {
            method: 'POST',
            body: JSON.stringify({
                username: teacherData.username,
                name: teacherData.name,
                password: '123456'
            })
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('成功');
        
        this.recordTest('创建老师账号', passed, 
            passed ? '' : `创建失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testDeleteTeacher() {
        // 先获取老师列表找到测试老师
        const teachers = await this.testGetTeachers();
        const testTeacher = teachers.find(t => t.username === this.testData.teachers[0].username);
        
        if (!testTeacher) {
            this.recordTest('删除老师账号', false, '找不到测试老师账号', 0);
            return false;
        }
        
        const startTime = Date.now();
        
        const response = await this.request(`/api/teachers/${testTeacher.id}`, {
            method: 'DELETE'
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('成功');
        
        this.recordTest('删除老师账号', passed, 
            passed ? '' : `删除失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testClassOptions() {
        this.log('🏫 测试年级班级选项...', 'info');
        
        const startTime = Date.now();
        
        // 获取所有年级班级
        const response = await this.request('/api/admin/class-options');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.grades && response.data.classes;
        
        this.recordTest('年级班级选项', passed, 
            passed ? '' : `获取失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        // 按年级获取班级
        const gradeResponse = await this.request('/api/admin/class-options?grade=2024');
        const gradePassed = gradeResponse.ok && gradeResponse.data.classes;
        
        this.recordTest('按年级获取班级', gradePassed, 
            gradePassed ? '' : `获取失败: ${gradeResponse.data?.message || gradeResponse.error}`, 
            Date.now() - startTime
        );
        
        return passed && gradePassed;
    }

    // ==================== 老师功能测试 ====================
    async testTeacherFunctions() {
        this.log('\n👨‍🏫 开始老师功能测试...', 'info');
        
        // 提交申请测试
        await this.testTeacherApplication();
        
        // 历史记录查询
        await this.testTeacherHistory();
        
        // 查看学生信息
        await this.testTeacherViewStudents();
        
        // 导出学生信息
        await this.testTeacherExportStudents();
        
        // 修改密码
        await this.testTeacherChangePassword();
    }

    async testTeacherApplication() {
        this.log('📝 测试老师提交申请...', 'info');
        
        const startTime = Date.now();
        
        const applicationData = {
            students: [
                { id: '2024001001', name: '张三' },
                { id: '2024001002', name: '李四' }
            ],
            delta: 5,
            reason: '老师功能测试申请',
            date: new Date().toISOString().slice(0, 10),
            teacher: 'teacher1'
        };
        
        const response = await this.request('/api/teacher/apply', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.message.includes('提交');
        
        this.recordTest('老师提交申请', passed, 
            passed ? '' : `提交失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testTeacherHistory() {
        const startTime = Date.now();
        
        const response = await this.request('/api/teacher/applications/history?user=teacher1');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data.applications);
        
        this.recordTest('老师历史记录', passed, 
            passed ? '' : `查询失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testTeacherViewStudents() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/students?grade=2024');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data.students);
        
        this.recordTest('老师查看学生', passed, 
            passed ? '' : `查询失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testTeacherExportStudents() {
        const startTime = Date.now();
        
        const exportData = {
            class_name: '2024级1班',
            students: this.testData.students.filter(s => s.grade === '2024' && s.class === '1')
                .map(s => ({
                    student_id: s.id,
                    name: s.name,
                    grade: s.grade,
                    class_name: s.class,
                    score: 100
                }))
        };
        
        const response = await this.request('/api/teacher/export-students', {
            method: 'POST',
            body: JSON.stringify(exportData)
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data instanceof Blob;
        
        this.recordTest('老师导出学生', passed, 
            passed ? '' : `导出失败: ${response.error}`, 
            duration
        );
        
        return passed;
    }    async testTeacherChangePassword() {
        this.log('🔐 测试老师密码修改（双重测试确保一致性）...', 'info');
        
        const originalPassword = 'teacher123';
        const tempPassword = 'temp_password_123';
        
        // 第一次测试：修改密码
        this.log('  第一步：修改密码到临时密码', 'info');
        const startTime1 = Date.now();
        
        const passwordData1 = {
            username: 'teacher1',
            currentPassword: originalPassword,
            newPassword: tempPassword
        };
        
        const response1 = await this.request('/api/teacher/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData1)
        });
        
        const duration1 = Date.now() - startTime1;
        const passed1 = response1.ok && response1.data.message.includes('成功');
        
        this.recordTest('老师修改密码（第一次）', passed1, 
            passed1 ? '成功修改到临时密码' : `修改失败: ${response1.data?.message || response1.error}`, 
            duration1
        );
        
        // 第二次测试：恢复原密码
        this.log('  第二步：恢复原密码', 'info');
        const startTime2 = Date.now();
        
        const passwordData2 = {
            username: 'teacher1',
            currentPassword: tempPassword,
            newPassword: originalPassword
        };
        
        const response2 = await this.request('/api/teacher/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData2)
        });
        
        const duration2 = Date.now() - startTime2;
        const passed2 = response2.ok && response2.data.message.includes('成功');
        
        this.recordTest('老师修改密码（恢复原密码）', passed2, 
            passed2 ? '成功恢复原密码' : `恢复失败: ${response2.data?.message || response2.error}`, 
            duration2
        );
          // 第三次测试：验证密码确实恢复了（尝试用原密码登录）
        this.log('  第三步：验证密码恢复成功', 'info');
        const startTime3 = Date.now();
        
        const loginData = {
            username: 'teacher1',
            password: originalPassword,
            userType: 'teacher'
        };
        
        const response3 = await this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        const duration3 = Date.now() - startTime3;
        const passed3 = response3.ok && response3.data.token && response3.data.userType === 'teacher';
        
        this.recordTest('验证密码恢复成功', passed3, 
            passed3 ? '密码验证成功，测试前后一致' : `验证失败: ${response3.data?.message || response3.error}`, 
            duration3
        );
        
        const overallPassed = passed1 && passed2 && passed3;
        this.log(`🔐 密码修改测试${overallPassed ? '✅ 完全成功' : '❌ 存在问题'}`, overallPassed ? 'success' : 'error');
        
        return overallPassed;
    }

    // ==================== 学生功能测试 ====================
    async testStudentFunctions() {
        this.log('\n🎓 开始学生功能测试...', 'info');
        
        // 查看学生信息
        await this.testStudentInfo();
        
        // 查看分值记录
        await this.testStudentScoreRecords();
    }

    async testStudentInfo() {
        const startTime = Date.now();
        
        const response = await this.request('/api/student/info?studentId=2024001001');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.student;
        
        this.recordTest('学生信息查询', passed, 
            passed ? '' : `查询失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    async testStudentScoreRecords() {
        const startTime = Date.now();
        
        const response = await this.request('/api/student/score-records?studentId=2024001001');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && Array.isArray(response.data.records);
        
        this.recordTest('学生分值记录', passed, 
            passed ? '' : `查询失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }    // ==================== 归档功能测试 ====================
    async testArchiveFunctions() {
        this.log('\n📁 开始归档功能测试...', 'info');
        
        // 第一步：添加1955年的测试学生数据
        await this.addTestStudentsFor1955();
        
        // 第二步：获取归档统计
        await this.testArchiveStats();
        
        // 第三步：执行1955年数据归档（安全测试）
        await this.testArchiveExecution1955();
        
        // 第四步：获取归档日志
        await this.testArchiveLogs();
        
        // 第五步：验证1955年数据已被归档
        await this.verifyArchiveExecution();
    }    async addTestStudentsFor1955() {
        this.log('📝 添加1955年测试学生数据...', 'info');
        
        const test1955Students = [
            { id: '1955001001', name: '测试学生1955-01', grade: '1955', class: '1' },
            { id: '1955001002', name: '测试学生1955-02', grade: '1955', class: '1' },
            { id: '1955001003', name: '测试学生1955-03', grade: '1955', class: '2' },
            { id: '1955002001', name: '测试学生1955-04', grade: '1955', class: '2' },
            { id: '1955002002', name: '测试学生1955-05', grade: '1955', class: '3' }
        ];

        const startTime = Date.now();
        
        try {
            // 使用批量导入API添加学生
            const response = await this.request('/api/admin/import', {
                method: 'POST',
                body: JSON.stringify({ students: test1955Students })
            });
            
            const duration = Date.now() - startTime;
            const passed = response.ok && response.data.message && response.data.message.includes('成功');
            
            if (passed) {
                this.log(`  ✅ 成功批量添加1955年学生 ${test1955Students.length} 个`, 'success');
            } else {
                this.log(`  ❌ 批量添加学生失败: ${response.data?.message || response.error}`, 'error');
            }
            
            this.recordTest('添加1955年测试学生', passed, 
                passed ? `批量添加成功 ${test1955Students.length} 个学生` : `批量添加失败: ${response.data?.message || response.error}`, 
                duration
            );
            
            return passed;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.log(`  ❌ 添加1955年学生异常: ${error.message}`, 'error');
            this.recordTest('添加1955年测试学生', false, `异常: ${error.message}`, duration);
            return false;
        }
    }

    async testArchiveStats() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/archive/stats');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && typeof response.data.totalStudents === 'number';
        
        if (passed) {
            this.log(`  📊 归档统计: 总学生数 ${response.data.totalStudents}`, 'info');
        }
        
        this.recordTest('归档统计信息', passed, 
            passed ? `总学生数: ${response.data.totalStudents}` : `获取失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }    async testArchiveExecution1955() {
        this.log('🗃️ 执行1955年数据归档测试...', 'info');
        
        const startTime = Date.now();
        
        const archiveData = {
            grades: ['1955'],
            reason: '测试归档功能 - 1955年历史数据清理',
            operator: 'admin'
        };
        
        const response = await this.request('/api/admin/archive/execute', {
            method: 'POST',
            body: JSON.stringify(archiveData)
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok && (
            response.data.message?.includes('成功') || 
            response.data.success === true ||
            (response.data.stats && response.data.stats.studentCount >= 0)
        );
        
        let details = '';
        if (passed) {
            // 修复：从正确的路径获取归档的学生数量
            const archivedCount = response.data.stats ? response.data.stats.studentCount : 0;
            const recordCount = response.data.stats ? response.data.stats.recordCount : 0;
            const applicationCount = response.data.stats ? response.data.stats.applicationCount : 0;
            
            details = `成功归档1955年数据，处理 ${archivedCount} 个学生，${recordCount} 条分数记录，${applicationCount} 条申请记录`;
            this.log(`  ✅ ${details}`, 'success');
            
            // 详细日志输出，便于调试
            if (response.data.stats) {
                this.log(`    📊 详细统计: 学生=${archivedCount}, 记录=${recordCount}, 申请=${applicationCount}`, 'info');
                this.log(`    📁 归档ID: ${response.data.archiveId || 'N/A'}`, 'info');
            }
        } else {
            details = `归档失败: ${response.data?.message || response.error}`;
            this.log(`  ❌ ${details}`, 'error');
            
            // 调试信息：打印响应结构
            if (response.data) {
                this.log(`    🔍 响应结构: ${JSON.stringify(response.data, null, 2)}`, 'debug');
            }
        }
        
        this.recordTest('执行1955年数据归档', passed, details, duration);
        
        return passed;
    }

    async verifyArchiveExecution() {
        this.log('🔍 验证1955年数据归档结果...', 'info');
        
        const startTime = Date.now();
        
        // 查询1955年的学生，应该已经被归档（不存在或数量为0）
        const response = await this.request('/api/admin/students?grade=1955');
        
        const duration = Date.now() - startTime;
        
        let passed = false;
        let details = '';
        
        if (response.ok) {
            const students1955 = response.data.students || [];
            passed = students1955.length === 0;
            details = passed ? 
                '1955年学生数据已成功归档（查询结果为空）' : 
                `仍有 ${students1955.length} 个1955年学生未归档`;
        } else {
            // 如果查询失败，可能是因为没有数据，这也是预期的
            passed = response.status === 404 || response.data?.message?.includes('未找到');
            details = passed ? 
                '1955年学生数据已归档（查询返回404）' : 
                `验证失败: ${response.data?.message || response.error}`;
        }
        
        this.recordTest('验证1955年数据归档', passed, details, duration);
        
        return passed;
    }    async testArchiveLogs() {
        const startTime = Date.now();
        
        const response = await this.request('/api/admin/archive/logs');
        
        const duration = Date.now() - startTime;
        const passed = response.ok && response.data.logs && Array.isArray(response.data.logs);
        
        this.recordTest('归档历史日志', passed, 
            passed ? `获取成功，共 ${response.data.logs.length} 条日志` : `获取失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        return passed;
    }

    // ==================== 数据完整性测试 ====================
    async testDataIntegrity() {
        this.log('\n🔍 开始数据完整性测试...', 'info');
        
        // 测试无效参数处理
        await this.testInvalidParameters();
        
        // 测试SQL注入防护
        await this.testSQLInjectionPrevention();
        
        // 测试大批量数据处理
        await this.testLargeDataHandling();
    }

    async testInvalidParameters() {
        const startTime = Date.now();
        
        // 测试空参数
        const response1 = await this.request('/api/admin/score', {
            method: 'POST',
            body: JSON.stringify({})
        });
        
        // 测试无效学号
        const response2 = await this.request('/api/student/info?studentId=invalid');
        
        const duration = Date.now() - startTime;
        const passed = !response1.ok && !response2.ok;
        
        this.recordTest('无效参数处理', passed, 
            passed ? '' : '应该拒绝无效参数', 
            duration
        );
        
        return passed;
    }

    async testSQLInjectionPrevention() {
        const startTime = Date.now();
        
        // 尝试SQL注入
        const maliciousId = "'; DROP TABLE students; --";
        const response = await this.request(`/api/student/info?studentId=${encodeURIComponent(maliciousId)}`);
        
        const duration = Date.now() - startTime;
        const passed = !response.ok || (response.ok && !response.data.student);
        
        this.recordTest('SQL注入防护', passed, 
            passed ? '' : 'SQL注入防护可能存在问题', 
            duration
        );
        
        return passed;
    }

    async testLargeDataHandling() {
        const startTime = Date.now();
        
        // 创建大量测试数据
        const largeStudentData = [];
        for (let i = 0; i < 100; i++) {
            largeStudentData.push({
                id: `9000${i.toString().padStart(6, '0')}`,
                name: `测试学生${i}`,
                grade: '2025',
                class: String(Math.floor(i / 20) + 1)
            });
        }
        
        const response = await this.request('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify({ students: largeStudentData })
        });
        
        const duration = Date.now() - startTime;
        const passed = response.ok;
        
        this.recordTest('大批量数据处理', passed, 
            passed ? '' : `大数据处理失败: ${response.data?.message || response.error}`, 
            duration
        );
        
        // 清理测试数据
        if (passed) {
            await this.request('/api/admin/students', {
                method: 'DELETE',
                body: JSON.stringify({ ids: largeStudentData.map(s => s.id) })
            });
        }
        
        return passed;
    }

    // ==================== 辅助方法 ====================
    async testCreateStudentData() {
        // 确保有测试学生数据用于学生登录测试
        await this.request('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify({ students: this.testData.students })
        });
    }

    // ==================== 主测试流程 ====================
    async runAllTests() {
        console.log('🚀 开始执行日常行为分管理系统完整功能测试');
        console.log('=' * 60);
        
        const overallStartTime = Date.now();
        
        try {
            // 检查服务器连接
            await this.checkServerConnection();
            
            // 用户认证测试
            await this.testUserAuthentication();
            
            // 管理员功能测试
            await this.testAdminFunctions();
            
            // 老师功能测试
            await this.testTeacherFunctions();
            
            // 学生功能测试
            await this.testStudentFunctions();
            
            // 归档功能测试
            await this.testArchiveFunctions();
            
            // 数据完整性测试
            await this.testDataIntegrity();
            
        } catch (error) {
            this.log(`❌ 测试过程中发生错误: ${error.message}`, 'error');
        }
        
        const overallDuration = Date.now() - overallStartTime;
        
        // 输出测试报告
        this.generateTestReport(overallDuration);
    }

    async checkServerConnection() {
        this.log('🔌 检查服务器连接...', 'info');
        
        const startTime = Date.now();
        
        try {
            const response = await this.request('/api/admin/students');
            const duration = Date.now() - startTime;
            
            if (response.status === 0) {
                throw new Error('无法连接到服务器，请确保服务器运行在 http://localhost:3000');
            }
            
            this.recordTest('服务器连接', true, '', duration);
            this.log('✅ 服务器连接正常', 'success');
            
        } catch (error) {
            this.recordTest('服务器连接', false, error.message, Date.now() - startTime);
            throw error;
        }
    }

    generateTestReport(totalDuration) {
        console.log('\n\n📊 测试报告');
        console.log('=' * 60);
        
        const passRate = ((this.testStats.passed / this.testStats.total) * 100).toFixed(2);
        
        console.log(`总测试数: ${this.testStats.total}`);
        console.log(`通过: ${this.testStats.passed}`);
        console.log(`失败: ${this.testStats.failed}`);
        console.log(`跳过: ${this.testStats.skipped}`);
        console.log(`通过率: ${passRate}%`);
        console.log(`总耗时: ${totalDuration}ms`);
        
        console.log('\n📋 详细结果:');
        console.log('-' * 60);
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            const details = result.details ? ` - ${result.details}` : '';
            console.log(`${status} ${result.name} (${result.duration}ms)${details}`);
        });
        
        // 保存测试报告到文件
        this.saveTestReport(totalDuration);
        
        console.log('\n🎯 测试完成!');
        
        if (this.testStats.failed > 0) {
            console.log('⚠️ 存在失败的测试项，请检查系统功能');
            process.exit(1);
        } else {
            console.log('🎉 所有测试通过！系统功能正常');
        }
    }

    saveTestReport(totalDuration) {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testStats.total,
                passed: this.testStats.passed,
                failed: this.testStats.failed,
                skipped: this.testStats.skipped,
                passRate: ((this.testStats.passed / this.testStats.total) * 100).toFixed(2),
                totalDuration
            },
            details: this.testResults
        };
        
        // 生成可读的时间戳格式：YYYY-MM-DD_HH-mm-ss
        const now = new Date();
        const timeStamp = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + '-' +
            String(now.getMinutes()).padStart(2, '0') + '-' +
            String(now.getSeconds()).padStart(2, '0');
        
        const reportPath = path.join(__dirname, `test_report_${timeStamp}.json`);
        
        try {
            fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
            this.log(`📝 测试报告已保存: ${reportPath}`, 'info');
        } catch (error) {
            this.log(`❌ 保存测试报告失败: ${error.message}`, 'error');
        }
    }
}

// 检查是否直接运行此脚本
if (require.main === module) {
    // 检查Node.js版本
    const nodeVersion = process.version;
    if (parseFloat(nodeVersion.slice(1)) < 18) {
        console.error('❌ 需要Node.js 18或更高版本来运行此测试');
        process.exit(1);
    }
    
    // 检查是否安装了fetch (Node.js 18+内置)
    if (typeof fetch === 'undefined') {
        console.error('❌ 此测试需要fetch API支持');
        process.exit(1);
    }
    
    const tester = new SystemTester();
    tester.runAllTests().catch(error => {
        console.error('❌ 测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = SystemTester;
