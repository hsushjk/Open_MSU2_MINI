# Open_MSU2_MINI

MSU2_MINI 可编程 USB 屏幕模块的硬件资料与通信协议整理。

模块丝印为 `Moriateliers`、`MN: MSU2M-24Q3`、`RISC-V-48MHz`，形态是一个贴片 USB 棒，正面装 0.96 英寸 160×80 彩色屏，侧面有触摸焊盘与三组排针焊盘。原厂没有公开原理图或 PCB 源文件，因此本仓库的连线表由实物照片、PCB 走线与固件外设配置序列交叉反推得到，协议部分由固件实现与官方上位机双向对照整理。

固件本身的反编译结果与缺陷分析在另一个仓库：[MSU2_MINI_FW_Reverse](https://github.com/hsushjk/MSU2_MINI_FW_Reverse)。

![PCB](docs/images/pcb.jpg)

## 仓库内容

```
docs/PINOUT.md       QFN-20 逐脚连线表、复用冲突、时钟与总线、连接器与器件
docs/PROTOCOL.md     与官方固件 V1.1 对应的 6 字节帧协议规范
docs/FLASHING.md     烧录方法（USB ISP，无需专用调试口）
netlist.csv          器件、脚位、网络、方向的机器可读网表
BOM.csv              物料清单
TODO.md              尚未实测或缺少源文件的条目
```

## 硬件概况

| 项目 | 规格 |
|---|---|
| 主控 | CH32X033F8P6，QFN-20，RISC-V 青稞内核，48 MHz |
| 程序存储 | 片内 64 KB flash，官方固件占用 24 224 B |
| 内存 | 20 KB SRAM |
| 外部存储 | P25D80H，1 MB SPI NOR，SOP-8 |
| 显示屏 | 0.96 英寸 160×80，ST7735S，8 脚 0.5 mm FPC |
| 背光 | 5 V 经 R1（5.1 Ω）直连，无开关管、无调光 |
| 供电 | USB 5 V 经 XC6206P33 降至 3.3 V |
| USB | A 型插头直插，复合设备（CDC-ACM 加 HID） |
| 交互 | 单个电容触摸电极，无按键、无复位键 |
| 尺寸 | 约 55 × 18 mm（据照片比例估测，未经实测） |

屏与 flash 共用 SPI1：屏走 PC3 片选，flash 走 PB7 片选。理解这块板子的关键就是这条总线和两个片选。

## 引脚摘要

完整表格见 [docs/PINOUT.md](docs/PINOUT.md)，网表见 [netlist.csv](netlist.csv)。

| 脚 | 网络 | 功能 |
|---|---|---|
| PA6 | SPI_MISO | flash 数据输出，兼作屏 D/C（一脚两用） |
| PA7 | SPI_MOSI | 屏与 flash 共用 |
| PA5 | SPI_SCLK | 屏与 flash 共用，固件按 24 MHz、模式 3 驱动 |
| PB7 | SPI_CS_Flash | flash 片选（低有效） |
| PC3 | SPI_CS_LCD | 屏片选（低有效） |
| PA0 | LCD_RST | 屏复位 |
| PC16 / PC17 | USB D− / D+ | D+ 另有 ISP 短接焊盘 |
| PB1 | TOUCH1 | 触摸电极，固件以 ADC 通道 9 采样 |
| PC18 / PC19 | I2C_DIO / I2C_CLK | 与 SWDIO / SWCLK 复用，引到 JP1 |
| PA2 / PA3 | TX2 / RX2 | USART2，固件只发送 |
| PA10 / PA11 | TX1 / RX1 | USART1，固件未使用 |
| PA4 / PA1 | SPI_CS1 / SPI_CS2 | 引到排针，固件未使用 |
| PA9 | — | 板上无负载，固件仍每次刷屏翻转 28 次 |

## 已知设计问题

1. PA6 一脚两用。片选都拉高、总线空闲时，PA6 仍被 MCU 当作推挽输出驱动到 D/C 电平，外挂的 SPI 从机会被顶住数据线。因此板上两组 SPI 排针实际只有写通路。
2. 背光不可调。R1 直接串在 5 V 与背光之间，没有开关管，无法调光或关屏；R1 仅 5.1 Ω，首次上电建议先串电流表。
3. I2C 与调试口复用。PC18/PC19 就是 SWDIO/SWCLK，接了 I2C 外设就没有调试口。
4. 没有复位键与 BOOT 键。进入 USB ISP 需要在上电瞬间短接 ISP 焊盘，具体操作见 [docs/FLASHING.md](docs/FLASHING.md)。
5. 丝印不带引脚名。板上只有 `J1`、`JP1`、`JP2`、`JP3`，引脚功能需对照本仓库的表格。
6. flash 的 `/WP` 与 `/HOLD` 均接死 3.3 V，写保护实际不起作用（对本用途无影响）。

## 复刻要点

- 屏：0.96 英寸 160×80、8 脚 FPC 的 ST7735S 模组市面可得。购买前确认排线是同向还是反向，以及 0.5 mm 的金手指间距，这是复刻最容易出错的一环。
- FPC 座：8P、0.5 mm、翻盖式，按屏排线厚度选型。
- LDO：XC6206P332MR（SOT-23），可用 ME6206、HT7333 替代。
- 背光调光改造：把 R1 换成低边 N-MOSFET，栅极接 PA9（原本的空脚，已引到 JP3 第 2 脚），现有固件不改也能复用该脚。
- 触摸电极：单焊盘电容触摸，形状与盖板厚度直接影响灵敏度，建议照实物尺寸复刻。

## 许可

本仓库的文档、连线表与网表采用 MIT License，见 [LICENSE](LICENSE)。

硬件事实由实物与固件反推，不保证与原厂设计完全一致，按此复刻的风险由使用者承担。`MSU2`、`Moriateliers`、`WCH`、`CH32` 等名称与商标归各自权利人所有，本项目与其无关联、未获授权。MIT 只覆盖版权，不授予任何专利权利。