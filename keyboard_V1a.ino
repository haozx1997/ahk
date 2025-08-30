#include <Keyboard.h>

#define BUTTON_PIN_2 2  // 文本输入按钮
#define BUTTON_PIN_3 3  // 组合键按钮
#define BUTTON_PIN_4 4  // 组合键按钮
#define BUTTON_PIN_5 5  // 组合键按钮
#define BUTTON_PIN_8 8  // 组合键按钮
#define LEFT_LED 17     // 左边LED
#define RIGHT_LED 30    // 右边LED

#define LED_ON LOW    // 开灯
#define LED_OFF HIGH  // 关灯

int IS_LEFT_LED_ON = 1;
void setup() {
  pinMode(BUTTON_PIN_2, INPUT_PULLUP);  // 启用内部上拉电阻
  pinMode(BUTTON_PIN_3, INPUT_PULLUP);  // 启用内部上拉电阻
  pinMode(BUTTON_PIN_4, INPUT_PULLUP);  // 启用内部上拉电阻
  pinMode(BUTTON_PIN_5, INPUT_PULLUP);  // 启用内部上拉电阻
  pinMode(BUTTON_PIN_8, INPUT_PULLUP);  // 启用内部上拉电阻

  pinMode(LEFT_LED, OUTPUT);   // 初始化LED引脚
  pinMode(RIGHT_LED, OUTPUT);  // 初始化LED引脚


  Keyboard.begin();  // 初始化键盘模拟
  twink(LEFT_LED, 3);
  twink(RIGHT_LED, 3);
}

void twink(int led, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(led, LED_ON);

    delay(50);                   // 字符间延时
    digitalWrite(led, LED_OFF);  // 初始状态关闭
    delay(50);                   // 字符间延时
  }
}

void loop() {
  delay(50);
  digitalWrite(LEFT_LED, LED_OFF);
  if (digitalRead(BUTTON_PIN_2) == LOW) {
    //digitalWrite(LEFT_LED, LED_ON); // 操作开始点亮
    do2();
    //Keyboard.print("2");SBtx666+

    //digitalWrite(LEFT_LED, LED_OFF);  // 操作结束熄灭
  }

  if (digitalRead(BUTTON_PIN_3) == LOW) {
    //digitalWrite(RIGHT_LED, LED_ON);
    do3();
    //Keyboard.print("3");
    //digitalWrite(RIGHT_LED, LED_OFF);
  }


  if (digitalRead(BUTTON_PIN_4) == LOW) {
    digitalWrite(LEFT_LED, LED_ON);
    do4();
    //Keyboard.print("3");
    digitalWrite(LEFT_LED, LED_OFF);
  }


  if (digitalRead(BUTTON_PIN_5) == LOW) {
    digitalWrite(RIGHT_LED, LED_ON);
    do4();
    //Keyboard.print("3");
    digitalWrite(RIGHT_LED, LED_OFF);
  }

  if (digitalRead(BUTTON_PIN_8) == LOW) {
    do8();
  }
}

void do2() {
  delay(50);                    // 简单防抖
  String message = "SBtx666+";  // 要输入的字符串

  for (int i = 0; i < message.length(); i++) {
    char c = message.charAt(i);  // 获取当前字符

    // 检查是否大写字母
    if (isUpperCase(c)) {
      Keyboard.press(KEY_LEFT_SHIFT);    // 按下Shift键
      Keyboard.press(c);                 // 按下字母键
      delay(80);                         // 按键保持时间
      Keyboard.release(c);               // 释放字母键
      Keyboard.release(KEY_LEFT_SHIFT);  // 释放Shift键
    }
    // 处理特殊字符
    else if (c == '+') {
      Keyboard.press(KEY_LEFT_SHIFT);  // Shift +
      Keyboard.press('=');             // +号在=键上
      delay(100);
      Keyboard.release('=');
      Keyboard.release(KEY_LEFT_SHIFT);
    }
    // 处理数字和小写字母
    else {
      Keyboard.press(c);
      delay(70);
      Keyboard.release(c);
    }

    delay(50);  // 字符间延时
  }

  // 最后按回车键
  Keyboard.press(KEY_RETURN);
  delay(50);
  Keyboard.release(KEY_RETURN);
  Keyboard.releaseAll();

  // 防止重复触发
  while (digitalRead(BUTTON_PIN_2) == LOW) {
    delay(10);
  }
}

// ctrl QWE
void do3() {
  delay(50);  // 防抖延时

  // 按下并释放Ctrl+Q
  Keyboard.press(KEY_LEFT_CTRL);
  delay(150);  // 保持按键时间
  Keyboard.press('q');
  delay(15);  // 保持按键时间

  Keyboard.press('w');
  delay(15);  // 保持按键时间

  Keyboard.press('e');
  delay(15);
  Keyboard.releaseAll();

  // 防止重复触发
  while (digitalRead(BUTTON_PIN_3) == LOW) {
    delay(10);
  }
}

void do4() {
  delay(50);  // 防抖延时


  // 防止重复触发
  while (digitalRead(BUTTON_PIN_4) == LOW) {
    delay(10);
  }
}

// ''''
void do8() {
  delay(50);  // 防抖延时
  Keyboard.press(KEY_RETURN);
  delay(50);
  Keyboard.release(KEY_RETURN);
  Keyboard.releaseAll();
  delay(100);

  Keyboard.print("''''");
  Keyboard.press(KEY_RETURN);
  delay(50);
  Keyboard.release(KEY_RETURN);
  Keyboard.releaseAll();
  // 防止重复触发
  while (digitalRead(BUTTON_PIN_8) == LOW) {
    delay(10);
  }
}
