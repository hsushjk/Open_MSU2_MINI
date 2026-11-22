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

// ---------------------------------------------------------------- 外形与尺寸
function boardSketch() {
  const p = [];
  const W = 1240, H = 700;

  // 20 px = 1 mm
  const BX = 140, BY = 200, BW = 910, BH = 260;   // 45.5 x 13 mm

  p.push(text(48, 46, 'MSU2_MINI 外形与尺寸', { size: 24, weight: '600' }));
  p.push(text(48, 74, '长度 45.5 mm、宽度 13 mm 为用户实测；触点区按 USB-A 规范、屏按可视比例绘制', { size: 13, fill: '#555' }));

  // 板轮廓
  p.push(rect(BX, BY, BW, BH, { fill: '#f4f1e6', stroke: '#5a5346', sw: 1.8, rx: 8 }));

  // 屏模组（推算尺寸，略宽于板，画在板之上以便看出外扩）
  p.push(rect(420, 195, 480, 270, { fill: 'none', stroke: '#9dbadd', dash: '6 5', sw: 1.2, rx: 3 }));
  p.push(text(902, 188, '屏模组外形（推算，未实测）', { size: 10.5, anchor: 'end', fill: '#7d97b8' }));

  // 可视区
  p.push(rect(443, 221, 434, 218, { fill: '#ffffff', stroke: '#3a6ba8', dash: '8 5', sw: 1.6 }));
  p.push(text(660, 322, '可视区 160 × 80', { size: 14, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(text(660, 348, '约 21.7 × 10.9 mm', { size: 12, anchor: 'middle', fill: '#3a6ba8' }));

  // USB-A 触点区
  p.push(rect(150, 238, 150, 166, { fill: 'none', stroke: '#8a6d24', dash: '5 4', sw: 1.2, rx: 3 }));
  const pins = [['252', 'VBUS', '5 V'], ['292', 'D−', 'PC16'], ['332', 'D+', 'PC17'], ['372', 'GND', '公共地']];
  pins.forEach(([y, net, pin]) => {
    const yy = Number(y);
    p.push(rect(162, yy, 120, 18, { fill: '#d9b45a', stroke: '#8a6d24', rx: 2 }));
    p.push(text(304, yy + 14, net, { size: 12, mono: true }));
    p.push(text(354, yy + 14, pin, { size: 11.5, fill: '#666' }));
  });
  p.push(text(150, 232, 'USB-A 触点区', { size: 11.5, fill: '#8a6d24' }));

  // 尺寸标注
  p.push(line(BX, 482, BX + BW, 482, { stroke: '#888', sw: 1 }));
  p.push(line(BX, 472, BX, 492, { stroke: '#888' }));
  p.push(line(BX + BW, 472, BX + BW, 492, { stroke: '#888' }));
  p.push(text(BX + BW / 2, 504, '45.5 mm（实测）', { size: 12, anchor: 'middle', fill: '#666' }));

  p.push(line(1080, BY, 1080, BY + BH, { stroke: '#888', sw: 1 }));
  p.push(line(1070, BY, 1090, BY, { stroke: '#888' }));
  p.push(line(1070, BY + BH, 1090, BY + BH, { stroke: '#888' }));
  p.push(text(1102, BY + BH / 2, '13 mm', { size: 12, fill: '#666', rot: 90 }));

  // 比例尺（20 px = 1 mm）
  for (let i = 0; i <= 10; i += 1) {
    p.push(line(140 + i * 20, 524, 140 + i * 20, 534, { stroke: '#888' }));
  }
  p.push(line(140, 529, 340, 529, { stroke: '#444', sw: 1 }));
  p.push(text(140, 552, '0', { size: 10, anchor: 'middle', mono: true, fill: '#666' }));
  p.push(text(240, 552, '5', { size: 10, anchor: 'middle', mono: true, fill: '#666' }));
  p.push(text(340, 552, '10 mm', { size: 10, anchor: 'middle', mono: true, fill: '#666' }));

  // 说明
  const notes = [
    '板厚与 USB 插头的加厚方式未实测：USB-A 插头要求厚约 2.0 mm，本板若仅 1.6 mm 需加垫片。',
    '前端触点直接做在板边铜箔上，无连接器；触点区至插入端约 12 mm，属 USB-A 规范的插合长度。',
    '屏模组外形按市售 0.96 英寸 160×80 模组（约 24 × 13.5 mm）推算，比板宽略大，实物需核对。',
    'U1 / U2 / U3、三组排针焊盘与触摸电极的板面位置未测绘；连线关系见 docs/PINOUT.md 与 netlist.csv。',
  ];
  p.push(text(48, 570, '说明', { size: 13, weight: '600' }));
  p.push(text(48, 594, notes.map((n, i) => `${i + 1}. ${n}`).join('\n'), { size: 12, fill: '#4a4438', lh: 21 }));

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