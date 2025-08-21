#Requires AutoHotkey v2.0
#SingleInstance Force
SendMode "Input" ; 推荐使用，速度和可靠性更好
SetWorkingDir A_ScriptDir ; 确保一致的起始目录

; 右边Alt功能 - 单击切换中英文，双击切换大小写
intCount := 0 ; 初始化计数器

RAlt::
{
    global intCount
    if (intCount > 0) ; 计时器已启动，记录按键次数
    {
        intCount += 1
        return
    }

    intCount := 1
    SetTimer func_r_alt, 200 ; 200毫秒内等待更多按键
    return
}

func_r_alt()
{
    global intCount
    SetTimer , 0 ; 关闭计时器

    if (intCount = 1) ; 单击
    {
        layout := GetCurrentKeyboardLayout()
        if (layout = 0x0804) ; 简体中文
            ;MsgBox "123"
            Send "^ " ; Ctrl+空格 (切换中英文)
        else
        ;MsgBox "312"
            Send "#{Space}"
    }
    else if (intCount = 2) ; 双击
    {
        if GetKeyState("CapsLock", "T") ; 检查大写锁定是否开启
        {
            SetCapsLockState false
        }
        else
        {
            SetCapsLockState true
        }
    }

    intCount := 0 ; 重置计数器
    return
}
; 获取当前输入法的语言标识符（Language Identifier）
GetCurrentKeyboardLayout()
{
    ; 获取前景窗口的线程ID，然后获取该线程的键盘布局
    threadId := DllCall("GetWindowThreadProcessId", "Ptr", WinExist("A"), "Ptr", 0)
    layoutId := DllCall("GetKeyboardLayout", "UInt", threadId, "UInt")

    ; 返回键盘布局的低16位（语言ID）
    return layoutId & 0xFFFF
}

; 功能键绑定 (右ctrl左边的按键)
AppsKey & Pause:: Send "{Volume_Mute}" ; 菜单键 + Pause: 静音
AppsKey & PgUp:: Send "{Volume_Up}" ; 菜单键 + PgUp: 增加音量
AppsKey & PgDn:: Send "{Volume_Down}" ; 菜单键 + PgDn: 降低音量
AppsKey & Insert:: Send "{Media_Play_Pause}" ; 菜单键 + Insert: 播放/暂停
AppsKey & Home:: Send "{Media_Prev}" ; 菜单键 + Home: 上一首
AppsKey & End:: Send "{Media_Next}" ; 菜单键 + End: 下一首

; Win键组合
#WheelDown:: Send "{Volume_Down}" ; Win + 滚轮下: 降低音量
#WheelUp:: Send "{Volume_Up}" ; Win + 滚轮上: 增加音量
#WheelRight:: Send "{Media_Next}" ; Win + 滚轮右: 下一首
#WheelLeft:: Send "{Media_Prev}" ; Win + 滚轮左: 上一首
#MButton:: Send "{Media_Play_Pause}" ; Win + 中键: 播放/暂停

; 其他热键
CapsLock::Ctrl ; 大写锁定键映射为Ctrl
XButton1:: Send "!+s" ; 侧键1发送Alt+Shift+S
Launch_App2:: Run "D:\me\Documents\ahk\win+L.bat" ; 启动应用2键运行脚本

; 使用ScrollLock切换双拼/全拼
ScrollLock::
{
    ; 分开根键和子路径
    RootKey := "HKEY_CURRENT_USER"
    SubKey := "SOFTWARE\Microsoft\InputMethod\Settings\CHS"
    ValueName := "Enable Double Pinyin"
    MainKey := "HKEY_CURRENT_USER\SOFTWARE\Microsoft\InputMethod\Settings\CHS"

    currentValue := RegRead(MainKey, ValueName)
    if (currentValue == 1) ; 当前是双拼
    {
        RegWrite 0, "REG_DWORD", MainKey, ValueName
        TrayTip "输入法已切换", "全拼模式已启用", "Iconi"
    }
    else ; 当前是全拼或未设置
    {
        RegWrite 1, "REG_DWORD", MainKey, ValueName
        TrayTip "输入法已切换", "双拼模式已启用", "Iconi"
    }

    SetTimer () => TrayTip(), -2000 ; 2秒后关闭提示
    return
}

; 修复滚轮问题 - 使用热键修饰符语法
~F24 & WheelUp:: Send "{Volume_Up}" ; F24 + 滚轮上: 提高音量
~F24 & WheelDown:: Send "{Volume_Down}" ; F24 + 滚轮下: 降低音量

F23:: {
    threshold := 10 ; 鼠标移动超过10像素才触发
    MouseGetPos(&startX, &y) ; 记录初始X坐标

    while GetKeyState("F23", "P") {
        Sleep(10) ; 降低CPU占用
        MouseGetPos(&currentX, &y)
        delta := currentX - startX

        if (delta > threshold) {
            Send("{Right down}") ; 按下右键
            KeyWait("F23", "T0.1") ; 等待F23释放或短暂超时
            Send("{Right up}") ; 确保释放按键
            break
        }
        else if (delta < -threshold) {
            Send("{Left down}") ; 按下左键
            KeyWait("F23", "T0.1")
            Send("{Left up}")
            break
        }
    }
}

; 系统托盘设置
A_TrayMenu.Delete()
A_TrayMenu.Add("退出脚本", (*) => ExitApp())
TraySetIcon("shell32.dll", 132) ; 设置音量图标

; 重新加载热键
;^!r::Reload
