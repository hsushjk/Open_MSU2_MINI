// 生成硬件仓库的自绘插图（系统框图、外形示意、连接器脚位）
// 只依赖 Node 内置模块；输出 SVG 到 docs/images/
'use strict';

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'docs', 'images');
const SANS = "'Microsoft YaHei','Noto Sans CJK SC','Source Han Sans SC',sans-serif";
const MONO = "'Consolas','Cascadia Mono',monospace";

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function text(x, y, body, o = {}) {
  const {
    size = 13, anchor = 'start', fill = '#1b1b1b', weight = '400',
    mono = false, rot = 0, lh = 0, opacity = 1,
  } = o;
  const lines = String(body).split('\n');
  const lineHeight = lh || Math.round(size * 1.5);
  const rotAttr = rot ? ` transform="rotate(${rot} ${x} ${y})"` : '';
  const span = lines
    .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${esc(l)}</tspan>`)
    .join('');
  return `<text x="${x}" y="${y}" font-family="${mono ? MONO : SANS}" font-size="${size}"`
    + ` fill="${fill}" font-weight="${weight}" text-anchor="${anchor}"`
    + ` opacity="${opacity}"${rotAttr}>${span}</text>`;
}

function rect(x, y, w, h, o = {}) {
  const { fill = 'none', stroke = '#333', sw = 1.4, rx = 6, dash = '' } = o;
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"`
    + ` stroke="${stroke}" stroke-width="${sw}"${d}/>`;
}

function line(x1, y1, x2, y2, o = {}) {
  const { stroke = '#333', sw = 1.4, dash = '', marker = '' } = o;
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  const m = marker ? ` marker-end="url(#${marker})"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}"`
    + ` stroke-width="${sw}"${d}${m}/>`;
}

function poly(points, o = {}) {
  const { fill = 'none', stroke = '#333', sw = 1.4 } = o;
  return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function arrow(x1, y1, x2, y2, o = {}) {
  const { stroke = '#333', sw = 1.4, dash = '' } = o;
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return line(x1, y1, x2, y2, { stroke, sw, dash })
    + `<polygon points="${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}" fill="${stroke}"/>`;
}

function figure(w, h, parts) {
  return [`<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<rect width="${w}" height="${h}" fill="#ffffff"/>`,
    ...parts,
    '</svg>', ''].join('\n');
}

// ---------------------------------------------------------------- 系统框图
function blockDiagram() {
  const p = [];
  const W = 1240, H = 780;

  p.push(text(48, 46, 'MSU2_MINI 系统框图', { size: 24, weight: '600' }));
  p.push(text(48, 74, '主控 CH32X033F8P6 · QFN-20 · 48 MHz 内部 RC 时钟（未启用 PLL）· 单 3.3 V 供电', { size: 13, fill: '#555' }));
  p.push(text(48, 96, '连线取自 netlist.csv；标注 ※ 的是固件行为与硬件连接不一致、或已被判定的设计缺陷', { size: 13, fill: '#b03030' }));

  // USB
  p.push(rect(48, 140, 190, 116, { fill: '#eef4fb' }));
  p.push(text(58, 164, 'USB-A 金手指', { size: 14, weight: '600' }));
  p.push(text(58, 188, 'VBUS   5 V\nD−     PC16\nD+     PC17\nGND    公共地', { size: 12.5, mono: true, lh: 17 }));

  // 电源
  p.push(rect(48, 300, 190, 96, { fill: '#fdf3e7' }));
  p.push(text(58, 324, 'U3  XC6206P33', { size: 14, weight: '600' }));
  p.push(text(58, 346, 'VIN 5 V → VOUT 3.3 V\n最大 100 mA 级，无使能脚', { size: 12, fill: '#444', lh: 17 }));
  p.push(rect(48, 410, 88, 52, { fill: '#fdf3e7' }));
  p.push(text(54, 430, 'C1 10 µF', { size: 11.5 }));
  p.push(text(54, 448, '5 V 侧', { size: 11, fill: '#666' }));
  p.push(rect(146, 410, 92, 52, { fill: '#fdf3e7' }));
  p.push(text(152, 430, 'C2 10 µF', { size: 11.5 }));
  p.push(text(152, 448, '3.3 V 侧', { size: 11, fill: '#666' }));

  // ISP
  p.push(rect(48, 486, 190, 76, { fill: '#f6f6f6' }));
  p.push(text(58, 508, 'ISP 短接盘', { size: 13, weight: '600' }));
  p.push(text(58, 528, 'USB_D+ 与 3.3 V\n仅上电瞬间短接', { size: 11.5, fill: '#555', lh: 17 }));

  // 主控
  p.push(rect(330, 140, 300, 340, { fill: '#eef7ef', stroke: '#2f6b39' }));
  p.push(text(342, 168, 'U1  CH32X033F8P6', { size: 15, weight: '600' }));
  p.push(text(342, 190, 'QFN-20 · 青稞 RV32 内核', { size: 12, fill: '#555' }));
  p.push(text(342, 222, [
    '64 KB 片内 flash',
    '20 KB SRAM',
    '48 MHz HSI，CFGR0 归零',
    'SPI1  主机 · 模式 3 · 24 MHz',
    'USBFS 全速设备',
    'TIM3  1 kHz 时基',
    'ADC   通道 9 / 15',
    'USART2 115200，仅发送',
  ].join('\n'), { size: 12.5, mono: true, lh: 20 }));

  // SPI1 总线
  p.push(line(630, 250, 668, 250, { sw: 2.2, stroke: '#2f6b39' }));
  p.push(line(668, 250, 668, 400, { sw: 2.2, stroke: '#2f6b39' }));
  p.push(line(668, 250, 700, 250, { sw: 2.2, stroke: '#2f6b39' }));
  p.push(line(668, 400, 700, 400, { sw: 2.2, stroke: '#2f6b39' }));
  p.push(text(664, 244, 'SPI1', { size: 11.5, weight: '600', fill: '#2f6b39', anchor: 'end' }));
  p.push(text(330, 502, 'SPI1 引脚：SCK PA5 · MOSI PA7 · MISO PA6（复用见 ※）', { size: 11.5, fill: '#2f6b39' }));

  // U2 flash
  p.push(rect(700, 196, 250, 108, { fill: '#eef4fb' }));
  p.push(text(712, 220, 'U2  P25D80H  1 MB', { size: 13.5, weight: '600' }));
  p.push(text(712, 242, '/CS  PB7    CLK  PA5\nDO   PA6    DI   PA7\n/WP  /HOLD 接 3.3 V', { size: 12, mono: true, lh: 17 }));

  // J1 屏
  p.push(rect(700, 340, 250, 190, { fill: '#eef4fb' }));
  p.push(text(712, 364, 'J1  0.96" 160×80', { size: 13.5, weight: '600' }));
  p.push(text(712, 386, 'ST7735S · 8P 0.5 mm FPC', { size: 12, fill: '#555' }));
  p.push(text(712, 412, '/CS   PC3   D/C  PA6\nSCLK  PA5   SDA  PA7\nRESET PA0   VDD  3.3 V\nLED+  经 R1 接 5 V', { size: 12, mono: true, lh: 18 }));

  // R1
  p.push(rect(700, 546, 250, 52, { fill: '#fdf3e7' }));
  p.push(text(712, 568, 'R1  5.1 Ω → 背光恒亮', { size: 12.5 })); 
  p.push(text(712, 586, '无开关管、无 PWM 调光', { size: 11.5, fill: '#666' }));

  // 触摸
  p.push(rect(330, 546, 150, 90, { fill: '#f3eefa' }));
  p.push(text(340, 568, 'TP1 触摸焊盘', { size: 13, weight: '600' }));
  p.push(text(340, 590, '网络名 Touch1（PB1）\n固件采样 ADC 通道 9', { size: 11.5, lh: 16, fill: '#444' }));

  // 排针
  p.push(rect(500, 546, 170, 150, { fill: '#f6f6f6' }));
  p.push(text(510, 568, 'JP1 / JP2 / JP3', { size: 13, weight: '600' }));
  p.push(text(510, 590, 'JP1 4P  I2C\nPC18 / PC19\nJP2 6P  TX1 RX1 CS2\nPA10 PA11 PA1\nJP3 6P  TX2 RX2 CS1\nPA2 PA3 PA4', { size: 11, mono: true, lh: 15 }));

  // 电源线
  p.push(arrow(238, 196, 330, 196, { stroke: '#c0743a' }));
  p.push(text(244, 188, '5 V', { size: 11, fill: '#c0743a' }));
  p.push(arrow(238, 348, 330, 348, { stroke: '#c0743a' }));
  p.push(text(244, 340, '3.3 V', { size: 11, fill: '#c0743a' }));

  // USB 总线
  p.push(arrow(238, 250, 330, 250, { stroke: '#3a6ba8' }));
  p.push(text(244, 242, 'USB FS', { size: 11, fill: '#3a6ba8' }));

  // TP1：ADC 通道 9 的说明写在模块框内，避免与总线注释相撞

  // 缺陷标注
  p.push(rect(684, 616, 300, 52, { fill: '#fdeeee', stroke: '#b03030', dash: '5 4' }));
  p.push(text(696, 638, '※ PA6 一脚两用：flash DO 与屏 D/C', { size: 12, fill: '#b03030' }));
  p.push(text(696, 656, 'SPI 排针实际只能写、不能读', { size: 11.5, fill: '#b03030' }));

  p.push(rect(712, 686, 256, 52, { fill: '#fdeeee', stroke: '#b03030', dash: '5 4' }));
  p.push(text(724, 708, '※ PA9 无负载，固件仍翻转 28 次', { size: 12, fill: '#b03030' }));
  p.push(text(724, 726, '原厂例程遗留的幽灵片选', { size: 11.5, fill: '#b03030' }));

  return figure(W, H, p);
}

// ---------------------------------------------------------------- 外形示意
function boardSketch() {
  const p = [];
  const W = 1240, H = 660;

  p.push(text(48, 46, 'MSU2_MINI 外形与功能分区示意', { size: 24, weight: '600' }));
  p.push(text(48, 74, '尺寸据实物照片估测，约 54 × 18 mm，板厚约 1.6 mm。分区位置为示意排列，不是测绘结果', { size: 13, fill: '#555' }));

  // 板轮廓：USB 舌片 + 主板
  p.push(poly('60,196 300,196 300,140 1180,140 1180,470 300,470 300,414 60,414',
    { fill: '#f4f1e6', stroke: '#5a5346', sw: 1.8 }));

  // USB 金手指
  [214, 264, 314, 364].forEach((y) => {
    p.push(rect(84, y, 196, 30, { fill: '#d9b45a', stroke: '#8a6d24', rx: 3 }));
  });
  p.push(text(182, 190, 'USB-A 触点：VBUS / D− / D+ / GND', { size: 12, anchor: 'middle', fill: '#5a5346' }));
  p.push(text(182, 442, '板边直接引出，无连接器', { size: 11, anchor: 'middle', fill: '#7a7264' }));

  const zone = (x, y, w, h, title, sub, fill) => {
    p.push(rect(x, y, w, h, { fill, dash: '6 4', stroke: '#7a7264', sw: 1.2, rx: 4 }));
    p.push(text(x + 12, y + 26, title, { size: 13.5, weight: '600' }));
    if (sub) p.push(text(x + 12, y + 48, sub, { size: 11.5, fill: '#5b5347', lh: 16 }));
  };

  zone(320, 158, 170, 122, '电源', 'U3 XC6206P33\nC1 / C2 10 µF', '#fdf3e7');
  zone(320, 300, 170, 150, '主控', 'U1 QFN-20\n48 MHz', '#eef7ef');
  zone(510, 158, 160, 122, '存储', 'U2 P25D80H\n1 MB SPI NOR', '#eef4fb');
  zone(510, 300, 160, 150, '触摸', 'TP1 焊盘\n固件采样 ADC 通道 9', '#f3eefa');
  zone(690, 158, 470, 244, '显示', '屏 0.96 英寸 160×80，ST7735S，8 脚 0.5 mm FPC', '#e8f1fb');

  // 可视区与 FPC 座
  p.push(rect(784, 232, 330, 150, { fill: '#ffffff', stroke: '#3a6ba8', dash: '8 5', sw: 1.6 }));
  p.push(text(949, 300, '可视区 160 × 80', { size: 13.5, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(text(949, 322, '约 21.7 × 10.9 mm', { size: 11.5, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(rect(790, 384, 320, 14, { fill: '#cfd8e6', stroke: '#3a6ba8' }));
  p.push(text(950, 380, 'J1  8P FPC 座', { size: 10.5, anchor: 'middle', fill: '#3a6ba8' }));

  // 排针焊盘带
  p.push(rect(690, 410, 470, 50, { fill: '#f6f6f6', dash: '5 4', stroke: '#7a7264', sw: 1.2, rx: 4 }));
  p.push(text(702, 440, 'JP1 / JP2 / JP3：2.54 mm 焊盘阵列，板上无器件', { size: 11.5, fill: '#5b5347' }));

  // 尺寸标注
  p.push(line(300, 496, 1180, 496, { stroke: '#888', sw: 1 }));
  p.push(line(300, 486, 300, 506, { stroke: '#888' }));
  p.push(line(1180, 486, 1180, 506, { stroke: '#888' }));
  p.push(text(740, 516, '约 54 mm（估测）', { size: 11.5, anchor: 'middle', fill: '#666' }));

  p.push(line(1204, 140, 1204, 470, { stroke: '#888', sw: 1 }));
  p.push(line(1194, 140, 1214, 140, { stroke: '#888' }));
  p.push(line(1194, 470, 1214, 470, { stroke: '#888' }));
  p.push(text(1220, 312, '约 18 mm', { size: 11.5, fill: '#666', rot: 90 }));

  // 说明
  const notes = [
    '器件面为正面，屏经 8 脚 0.5 mm FPC 直贴主板，未见背光升压电路。',
    '背光由 5 V 经 R1 = 5.1 Ω 限流直驱，无开关管，因此无法调光。',
    'TP1 为板边覆铜焊盘，原理图网络名为 Touch1，固件按 ADC 通道 9 采样。',
    'JP1 / JP2 / JP3 只有焊盘，未焊排针；ISP 短接盘位于 USB_D+ 与 3.3 V 之间。',
  ];
  p.push(text(60, 556, '说明', { size: 13, weight: '600' }));
  p.push(text(60, 580, notes.map((n, i) => `${i + 1}. ${n}`).join('\n'), { size: 12, fill: '#4a4438', lh: 22 }));

  return figure(W, H, p);
}

// ---------------------------------------------------------------- 连接器脚位
function connectors() {
  const p = [];
  const W = 1240, H = 660;

  p.push(text(48, 46, '连接器与器件脚位', { size: 24, weight: '600' }));
  p.push(text(48, 74, '脚位顺序按器件标记的 1 脚起算；网络名与 MCU 引脚取自 netlist.csv', { size: 13, fill: '#555' }));

  const pinRow = (x, y, pitch, count, vertical, title, rows) => {
    p.push(text(x + (vertical ? -14 : 0), y - 26, title, { size: 13, weight: '600' }));
    for (let i = 0; i < count; i += 1) {
      const px = vertical ? x : x + i * pitch;
      const py = vertical ? y + i * pitch : y;
      p.push(rect(px, py, vertical ? 26 : 26, vertical ? 22 : 22, { fill: '#ffffff', stroke: '#444', rx: 2 }));
      p.push(text(px + 13, py + 16, String(i + 1), { size: 11, anchor: 'middle', mono: true }));
      const r = rows[i] || ['', ''];
      if (vertical) {
        p.push(text(px + 36, py + 16, r[0], { size: 12, mono: true }));
        p.push(text(px + 150, py + 16, r[1], { size: 11.5, fill: '#666' }));
      } else {
        p.push(text(px + 13, py + 44, r[0], { size: 10.5, anchor: 'middle', mono: true }));
        p.push(text(px + 13, py + 60, r[1], { size: 10, anchor: 'middle', fill: '#666' }));
      }
    }
  };

  // J1
  pinRow(80, 160, 26, 8, true, 'J1  显示屏 FPC（8P，0.5 mm）', [
    ['LED+', '经 R1 → 5 V'], ['GND', '地'], ['RESET', 'PA0'], ['D/C', 'PA6 ※'],
    ['SDA', 'PA7'], ['SCLK', 'PA5'], ['VDD', '3.3 V'], ['CS', 'PC3'],
  ]);

  // JP1
  pinRow(400, 160, 52, 4, false, 'JP1（4P，2.54 mm）', [
    ['5V', ''], ['GND', ''], ['I2C_DIO', 'PC18'], ['I2C_CLK', 'PC19'],
  ]);

  // JP2
  pinRow(400, 300, 52, 6, false, 'JP2（6P，2.54 mm）', [
    ['5V', ''], ['GND', ''], ['3.3V', ''], ['TX1', 'PA10'], ['RX1', 'PA11'], ['CS2', 'PA1'],
  ]);

  // JP3
  pinRow(400, 410, 52, 6, false, 'JP3（6P，2.54 mm）', [
    ['GND', ''], ['PA9', '※ 无负载'], ['3.3V', ''], ['TX2', 'PA2'], ['RX2', 'PA3'], ['CS1', 'PA4'],
  ]);

  // U2
  pinRow(800, 150, 40, 4, true, 'U2  P25D80H 左侧（1–4）', [
    ['/CS', 'PB7'], ['DO', 'PA6 ※'], ['/WP', '3.3 V'], ['GND', '地'],
  ]);
  pinRow(800, 372, 40, 4, true, 'U2  P25D80H 右侧（5–8）', [
    ['DI', 'PA7'], ['CLK', 'PA5'], ['/HOLD', '3.3 V'], ['VCC', '3.3 V'],
  ]);

  // U3
  p.push(text(800, 556, 'U3  XC6206P33（SOT-23）', { size: 13, weight: '600' }));
  p.push(text(800, 580, 'VIN = 5 V     GND = 地     VOUT = 3.3 V', { size: 12, mono: true }));

  p.push(text(80, 600, '※ 标记为复用或未连接：PA6 同时作 flash DO 与屏 D/C；PA9 引到 JP3-2 但板上无负载。', { size: 12, fill: '#b03030' }));

  return figure(W, H, p);
}

// ---------------------------------------------------------------- 输出
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const targets = [
  ['system-block.svg', blockDiagram()],
  ['board-sketch.svg', boardSketch()],
  ['connectors.svg', connectors()],
];
for (const [name, body] of targets) {
  fs.writeFileSync(path.join(OUT, name), body, 'utf8');
  console.log(`${name}  ${Buffer.byteLength(body, 'utf8')} B`);
}