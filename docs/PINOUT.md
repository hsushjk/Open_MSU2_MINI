# 引脚连线表

本表由实物照片、PCB 走线与固件 GPIO 配置序列（`GPIO_Init` / `RCC_AHBPeriphClockCmd` / `AFIO->CTRLR` 写入）逐脚反推。
**原厂原理图从未公开**，因此以下内容不保证与原厂设计逐比特一致，但已被固件行为与实测功能验证。

QFN-20 封装：18 个可编程 I/O + VDD + VSS。

| 封装脚 | 引脚 | 网络名 | 方向 | 连接对象 | 固件访问 | 备注 |
|---:|---|---|---|---|---|---|
| 1 | PA6 | SPI_MISO | I/O | U2.DO（flash 数据输出）+ J1.4（LCD D/C） | 大量 | **一脚两用**：读 flash 时作输入，刷屏时作 D/C 推挽输出 |
| 2 | PA7 | SPI_MOSI | O | U2.DI + J1.5 | 大量 | 屏与 flash 共用 |
| 3 | PB1 | Touch1 | 模拟 | 圆形铜箔触摸焊盘 TP1 | 间接 | 固件用 ADC 第 9 通道采样（按数据手册核对 ADC9 的复用脚） |
| 4 | PB7 | SPI_CS_Flash | O | U2.CS# | 大量 | 低有效 |
| 5 | PC16 | USB_DM | I/O | USB A 型插头 D− | 硬件外设 | USB 全速 |
| 6 | PC17 | USB_DP | I/O | USB A 型插头 D+ + ISP 短接焊盘 | 硬件外设 | 上电瞬间短接 3.3 V 进 ROM ISP |
| 7 | VDD | — | 电源 | 3.3 V（U3 输出） | — | |
| 8 | PC18 | I2C_DIO | I/O | JP1.1 / 调试口 SWDIO | **0 次** | 与 SWDIO 复用 |
| 9 | VSS | — | 地 | GND | — | |
| 10 | PA9 | （无网络） | — | **无负载** | **28 次翻转** | 幽灵片选，见下方问题 2 |
| 11 | PA11 | RX1 | I | 仅到排针 | **0 次** | USART1 未使用 |
| 12 | PA10 | TX1 | O | 仅到排针 | **0 次** | USART1 未使用 |
| 13 | PC3 | SPI_CS_LCD | O | J1.8（LCD CS） | 大量 | 低有效；**这才是真正的屏片选** |
| 14 | PA0 | LCD_RST | O | J1.3（LCD RESET） | 少量 | |
| 15 | PA1 | SPI_CS2 | O | JP2/JP3 排针 | **0 次** | 未使用 |
| 16 | PA2 | TX2 | O | JP 排针 | 少量 | USART2 调试输出（115200，8N1，只发不收） |
| 17 | PA3 | RX2 | I | JP 排针 | **0 次** | USART2 从未配置接收 |
| 18 | PC19 | I2C_CLK | I/O | JP1.2 / 调试口 SWCLK | **0 次** | 与 SWCLK 复用 |
| 19 | PA4 | SPI_CS1 | O | JP2/JP3 排针 | **0 次** | 未使用 |
| 20 | PA5 | SPI_SCLK | O | U2.CLK + J1.6 | 大量 | 屏与 flash 共用，固件 24 MHz / 模式 3 |

> 脚号与丝印不是一一对应：板上只印了 `J1 / JP1 / JP2 / JP3`，没有任何引脚名。

## 复用冲突一览

| 冲突 | 引脚 | 后果 |
|---|---|---|
| flash MISO ↔ 屏 D/C | PA6 | 总线空闲时 PA6 仍被推挽驱动，外挂 SPI 从机的 DO 会被顶住 → 排针 SPI **只能写不能读** |
| flash CS ↔ 屏 CS | PB7 / PC3 | 同一总线上两个从机，靠片选区分；固件全程软件片选，无硬件 NSS |
| I2C ↔ SWD | PC18 / PC19 | 接了 I2C 就没有调试口 |
| 触摸 ↔ 数字口 | PB1 | 只能以模拟方式读，不能当普通按键用 |

## 固件侧访问统计（全镜像扫描结果）

- **有访问**：PA6、PA7、PA5、PB7、PC3、PA0、PA2、PB1（ADC）
- **零访问**：PA1、PA4、PA9（翻转但无负载）、PA10、PA11、PA3、PC18、PC19
- 也就是说：**板上 6 个排针脚位的功能（I2C、USART1、双 SPI_CS）在官方固件里一个都没实现**，全部是留给"以后"的占位。

## 时钟与总线

| 项目 | 值 | 来源 |
|---|---|---|
| 系统时钟 | 48 MHz（HSI 内部 RC，无 PLL、无外部晶振） | `SystemInit` 只写 HSI 使能 + 2 个 flash 等待周期，`CFGR0` 最终归零 |
| SPI1 | 主机 / 8 位 / 模式 3（CPOL=1 CPHA=1）/ 软件 NSS / 2 分频 ⇒ **24 MHz** | `SPI1->CTLR1 ≈ 0x0307`，`CTLR2 = 0x03` |
| USART2 | 115200 8N1，仅 TX | `BRR = 0x1A1` |
| TIM3 | 1 kHz（PSC=47, ARR=999），仅做系统 tick | 用于 5 秒通信超时 |
| ADC | 通道 9 = 触摸，通道 15 = 心跳 | 上位机 `read_touch()` / `heartbeat()` |

**注意**：ST7735S 官方上限约 15 MHz，本固件按 24 MHz 驱动，属超规格运行；实测能用，但不保证每片屏都稳定。