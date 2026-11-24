# Open_MSU2_MINI

MSU2_MINI（丝印 `Moriateliers` / `MN: MSU2M-24Q3`）的硬件资料与协议文档：一块 45.5×13×2.0 mm、板边直接做 USB-A 插头的 RISC-V 小副屏，CH32X033F8P6 + P25D80H + ST7735S 160×80 + 单电极触摸，无按键、无复位键、无调试口。

## 关键特性

- **板边即插头**：4 根 USB 金手指直接做在板边铜箔上，插进 USB-A 口就能用，不用线。
- **单芯片带屏带存储**：CH32X033F8P6（RV32IMAC 48 MHz、62 KB flash、20 KB RAM）+ 1 MB SPI NOR + 160×80 RGB565 屏。
- **单电极触摸**：13×5.9 mm 网格铜箔压在阻焊层下，走 ADC 通道 9 的 TKey 采样。
- **无调试口也能救**：短接 `USB_D+` 与 `3.3V` 两个焊盘上电即进 ROM ISP。
- **资料自洽**：引脚表、网表、BOM、原理图画法脚本、刷写说明、完整协议表都在本仓库。

## 仓库内容

| 路径 | 内容 |
| --- | --- |
| [`docs/PINOUT.md`](docs/PINOUT.md) | 20 脚全表、连接器、时钟总线、复用冲突、机械尺寸 |
| [`docs/PROTOCOL.md`](docs/PROTOCOL.md) | 原厂 V1.1 协议（实测整理）+ 自研固件 v1.0.0 协议全表 |
| [`docs/FLASHING.md`](docs/FLASHING.md) | USB ROM ISP 刷写与救砖焊盘操作 |
| `docs/images/system-block.svg` | 系统框图（主控 / NOR / 屏 / 触摸 / 电源） |
| `docs/images/board-views.svg` | 正反面元件布局与丝印 |
| `docs/images/connectors.svg` | J1 / JP1 / JP2 / JP3 / U2 引脚朝向 |
| `netlist.csv` | 网表（元件-脚位-网络名） |
| `BOM.csv` | 物料清单 |
| `tools/gen_figures.js` | 生成上面三张 SVG 的脚本（改尺寸/位号后重跑） |
| `TODO.md` | 已知待办与复刻反馈 |

三张 SVG 与网表都是脚本/表格生成的，改数据再跑脚本即可，不用手改图。

## 硬件概况

| 部件 | 型号 | 说明 |
| --- | --- | --- |
| 主控 | CH32X033F8P6（QFN-20） | 18 IO + VDD + VSS；内部 HSI 48 MHz，无 PLL 无晶振；64 KB flash（原厂固件占 24 224 B）、20 KB SRAM |
| 存储 | P25D80H（SOP-8） | 1 MB SPI NOR，/WP 与 /HOLD 均接死 3.3 V |
| 屏 | ST7735S 0.96" | 160×80，8 脚 0.5 mm FPC，RASET 有 24 行偏移，SPI 模式 3 |
| 电源 | XC6206P33（SOT-23） | 5 V → 3.3 V；背光 5 V 经 R1 5.1 Ω 直连 |
| 触摸 | 单电极 TP1 | 13×5.9 mm 网格铜箔，位于阻焊层下，无开窗 |
| 连接器 | J1 8P FPC / JP1 4P / JP2 6P / JP3 6P | 排针未焊接，见下 |

| 机械项 | 值 |
| --- | --- |
| 板长×宽×厚 | 45.5 × 13 × 2.0 mm（±0.2） |
| USB 触点 | 4 根，中心距 2.0 mm，长约 6 mm，外侧两根加宽 |
| 触点区到穿线孔 | 9.0 mm；穿线孔径 1.7 × 7.0 mm |
| 排针焊盘 | 间距 2.5 mm，每列 6 个（1 方 + 5 圆），圆心到板边 1.1 mm |
| 触摸电极 | 6.0 × 13.0 mm，距板端 1.0 mm，覆盖全宽 |

**JP1 / JP2 / JP3 未焊接，暂不支持**：它们与屏共用 SPI，且 JP1 的 I2C 与 SWD 复用，接上就换走了调试口。

## 已知设计问题

| # | 问题 | 影响 |
| --- | --- | --- |
| 1 | PA6 一脚两用（NOR MISO = 屏 D/C） | 排针 SPI 只有写通路；屏刷新与 NOR 访问必须严格串行 |
| 2 | 背光 5 V 直连，R1 仅 5.1 Ω 限流 | 亮度不可调，无处关机 |
| 3 | PC18 / PC19 的 I2C 与 SWD 复用 | 想接 I2C 外设就得放弃 SWD 调试 |
| 4 | 无复位键、无 BOOT 键 | 只能上电瞬间短接 `USB_D+`/`3.3V` 进 ISP |
| 5 | 丝印只有 J1/JP1/JP2/JP3，无引脚名 | 飞线前必须对着 `docs/PINOUT.md` |
| 6 | NOR 的 /WP 与 /HOLD 接死 3.3 V | 写保护失效，误擦写无硬件拦截 |

## 复刻要点

- **屏排线最容易错**：同向/反向、8 脚 0.5 mm 金手指间距，买屏前先确认 FPC 触点朝上面还是下面。
- FPC 座用 8P 0.5 mm 翻盖式；LDO 可换 ME6206 / HT7333 同封装替代。
- 想调背光：把 R1 换成低边 N-MOSFET，栅极接 PA9（已引到 JP3 第 2 脚），固件侧对应 PWM 即可。
- 触摸电极按实物尺寸（13×5.9 mm 网格铜箔）复刻，形状变了阈值要重标。
- 屏在板正面、主控与 NOR 在屏正后方的背面，贴装顺序按 `docs/images/board-views.svg`。

## 相关仓库

| 仓库 | 内容 |
| --- | --- |
| [`Open_MSU2_MINI_FW`](../Open_MSU2_MINI_FW) | 自研固件 v1.0.0：流式刷屏、NOR 资产、开机/待机、免拆 OTA、自检命令 |
| [`Open_MSU2_MINI_Console`](../Open_MSU2_MINI_Console) | 上位机 v1.0.0：WebUI、插件、CLI、OTA、自检 |
| [`MSU2_MINI_FW_Reverse`](../MSU2_MINI_FW_Reverse) | 原厂固件反编译产物与分析报告 |

## 许可

硬件资料与文档采用 MIT。原厂固件版权归 WCH / 厂商所有，本仓库不包含原厂固件本体。