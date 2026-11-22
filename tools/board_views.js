// 正反两面示意图：位置按实物照片比例估算（20 px = 1 mm），沿长边自 USB 端起算
'use strict';

module.exports = function boardViews({ text, rect, line, figure }) {
  const p = [];
  const W = 1240, H = 1040;

  const X0 = 150, MM = 20, LEN = 45.5, WID = 13;
  const BW = LEN * MM;          // 910
  const BH = WID * MM;          // 260
  const FY = 150;               // 正面
  const BY = 560;               // 背面
  const mx = (mm) => X0 + mm * MM;

  p.push(text(48, 46, 'MSU2_MINI 正反两面', { size: 24, weight: '600' }));
  p.push(text(48, 74, '板长 45.5 mm、板宽 13 mm、板厚 2.0 mm（用户实测）；比例为 1:1，即 20 px = 1 mm', { size: 13, fill: '#555' }));
  p.push(text(48, 96, '板面按实物照片定序，纵向位置为按比例估算，误差约 ±1 mm', { size: 12, fill: '#8a5a24' }));

  // ---------------------------------------------------------------- 正面
  p.push(text(48, 126, '正面（贴屏面）：USB 触点、屏、触摸电极，别无其他', { size: 15, weight: '600' }));
  p.push(rect(X0, FY, BW, BH, { fill: '#f4f1e6', stroke: '#5a5346', sw: 1.8, rx: 8 }));

  // USB 触点：4 根，2 mm 间距
  [188, 248, 308, 368].forEach((y) => {
    p.push(rect(mx(0.6), y, 118, 18, { fill: '#d9b45a', stroke: '#8a6d24', rx: 2 }));
  });
  p.push(text(mx(0.6), FY - 10, 'USB-A 触点 ×4（板边铜箔，约 6 mm 长，2 mm 间距，外侧两根更宽）', { size: 11.5, fill: '#8a6d24' }));

  // 屏的占位（虚线）
  p.push(rect(mx(13), FY + 16, 434, 218, { fill: 'none', stroke: '#3a6ba8', dash: '8 5', sw: 1.6 }));
  p.push(text(mx(27.6), FY + 110, '屏 160 × 80', { size: 14, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(text(mx(27.6), FY + 134, '可视区约 21.7 × 10.9 mm', { size: 11.5, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(text(mx(27.6), FY + 156, '模组覆盖穿线孔、排针焊盘与主控', { size: 11.5, anchor: 'middle', fill: '#3a6ba8' }));

  // 穿线孔（正面可见）
  p.push(rect(mx(20), FY + 60, 34, 140, { fill: '#ffffff', stroke: '#5a5346', sw: 1.4, rx: 3 }));
  p.push(text(mx(20.85), FY + 220, '穿线孔 1.7 × 7', { size: 10.5, anchor: 'middle', fill: '#5a5346' }));

  // 排针通孔（正反贯通的实孔，正面同样可见）
  for (let i = 0; i < 5; i += 1) {
    const cx = mx(22.5 + i * 2.54);
    p.push(`<circle cx="${cx}" cy="${FY + 30}" r="8" fill="#f4f1e6" stroke="#8a8378" stroke-width="1.2"/>`);
    p.push(`<circle cx="${cx}" cy="${FY + 230}" r="8" fill="#f4f1e6" stroke="#8a8378" stroke-width="1.2"/>`);
  }

  // 触摸电极
  p.push(rect(mx(39.6), FY, 118, BH, { fill: '#f6dfc8', stroke: '#b07b3c', sw: 1.2, rx: 4 }));
  p.push(text(mx(43.6), FY + 34, '触摸电极', { size: 12, anchor: 'middle', fill: '#8a5a24' }));
  p.push(text(mx(43.6), FY + 54, '13 × 5.9', { size: 11, anchor: 'middle', fill: '#8a5a24' }));
  p.push(text(mx(43.6), FY + 72, '网格铜箔', { size: 10.5, anchor: 'middle', fill: '#8a5a24' }));
  p.push(`<circle cx="${mx(42.5)}" cy="${FY + 130}" r="16" fill="#f4f1e6" stroke="#5a5346" stroke-width="1.4"/>`);

  // 正面尺寸
  p.push(line(X0, FY + BH + 30, X0 + BW, FY + BH + 30, { stroke: '#888' }));
  p.push(line(X0, FY + BH + 22, X0, FY + BH + 38, { stroke: '#888' }));
  p.push(line(X0 + BW, FY + BH + 22, X0 + BW, FY + BH + 38, { stroke: '#888' }));
  p.push(text(X0 + BW / 2, FY + BH + 52, '45.5 mm', { size: 12, anchor: 'middle', fill: '#666' }));

  // ---------------------------------------------------------------- 背面
  p.push(text(48, 532, '背面（贴装面，厂商渲染图即此面）：屏座、主控、flash、排针焊盘与电源', { size: 15, weight: '600' }));
  p.push(rect(X0, BY, BW, BH, { fill: '#f4f1e6', stroke: '#5a5346', sw: 1.8, rx: 8 }));

  // J1 屏座（紧贴穿线孔靠插头一侧）
  p.push(rect(mx(15.4), BY + 70, 86, 120, { fill: '#cfd8e6', stroke: '#3a6ba8', rx: 2 }));
  for (let i = 0; i < 8; i += 1) {
    p.push(line(mx(15.4) + 14 + i * 7.5, BY + 70, mx(15.4) + 14 + i * 7.5, BY + 82, { stroke: '#3a6ba8', sw: 1.2 }));
  }
  p.push(text(mx(15.4) + 43, BY + 56, 'J1 屏座 8P', { size: 11, anchor: 'middle', fill: '#3a6ba8' }));

  // 穿线孔（背面）
  p.push(rect(mx(20), BY + 60, 34, 140, { fill: '#ffffff', stroke: '#5a5346', sw: 1.4, rx: 3 }));

  // 排针焊盘：两列各 5 个，方焊盘在穿线孔两侧
  for (let i = 0; i < 5; i += 1) {
    const cx = mx(22.5 + i * 2.54);
    p.push(`<circle cx="${cx}" cy="${BY + 30}" r="9" fill="#cfd8e6" stroke="#3a6ba8"/>`);
    p.push(`<circle cx="${cx}" cy="${BY + 230}" r="9" fill="#cfd8e6" stroke="#3a6ba8"/>`);
  }
  p.push(text(mx(35.6), BY + 34, 'JP3', { size: 11, fill: '#3a6ba8' }));
  p.push(text(mx(35.6), BY + 234, 'JP2', { size: 11, fill: '#3a6ba8' }));

  // U2 flash
  p.push(rect(mx(22.6), BY + 90, 100, 80, { fill: '#3a3a3a', stroke: '#111', rx: 2 }));
  p.push(text(mx(25.1), BY + 134, 'U2', { size: 12, anchor: 'middle', fill: '#f0f0f0' }));
  p.push(text(mx(25.1), BY + 156, 'P25D80H', { size: 10, anchor: 'middle', fill: '#d8d8d8' }));

  // U1 主控
  p.push(rect(mx(29.8), BY + 99, 62, 62, { fill: '#2b2b2b', stroke: '#111', rx: 3 }));
  p.push(text(mx(31.35), BY + 134, 'U1', { size: 12, anchor: 'middle', fill: '#f0f0f0' }));

  // C1 / C2 / R1
  p.push(rect(mx(13.2), BY + 96, 14, 34, { fill: '#c8a24a', stroke: '#8a6d24', rx: 2 }));
  p.push(text(mx(13.9), BY + 148, 'C1', { size: 10, anchor: 'middle' }));
  p.push(rect(mx(13.2), BY + 176, 14, 34, { fill: '#c8a24a', stroke: '#8a6d24', rx: 2 }));
  p.push(text(mx(13.9), BY + 228, 'C2', { size: 10, anchor: 'middle' }));
  p.push(rect(mx(11.4), BY + 226, 34, 14, { fill: '#3a3a3a', stroke: '#111', rx: 2 }));
  p.push(text(mx(12.4), BY + 220, 'R1', { size: 10, anchor: 'middle' }));

  // JP1 与触摸端焊盘
  [40.2, 41.6, 43.0, 44.4].forEach((mm) => {
    p.push(rect(mx(mm) - 9, BY + 26, 18, 18, { fill: '#cfd8e6', stroke: '#3a6ba8', rx: 2 }));
  });
  p.push(text(mx(42.3), BY + 20, 'JP1', { size: 11, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(`<circle cx="${mx(42.5)}" cy="${BY + 130}" r="16" fill="#f4f1e6" stroke="#5a5346" stroke-width="1.4"/>`);

  // FPC 路径
  p.push(line(mx(20.9), BY + 130, mx(19.6), BY + 130, { stroke: '#c0398a', sw: 2.4, dash: '7 4' }));
  p.push(text(mx(21.5), BY + BH + 26, 'FPC：正面 → 穿线孔 → J1', { size: 10.5, fill: '#c0398a' }));

  // 说明
  const notes = [
    '板厚 2.0 mm，USB-A 插头由 PCB 板边直接成型，无需垫片与连接器。',
    '正面只有三样东西：USB 触点、屏、触摸电极；主控、flash、屏座、焊盘全在背面，位于屏的正后方。',
    '屏的 FPC 从正面穿过穿线孔，折到背面插入 J1；J1 紧贴穿线孔靠插头一侧。',
    '两列排针焊盘各 5 个圆孔，穿线孔两侧另有方焊盘；丝印给 JP2、JP3 各标注 6 个网络名，方焊盘是否为第 1 脚待确认。',
    '触摸电极为阻焊层下的网格铜箔，表面无开窗、无凸起，斜光下呈细密网格反光。',
    '触摸端居中有一个穿透板面的圆孔，直径未测，正反两面在同一位置。',
  ];
  p.push(text(48, 900, '说明', { size: 13, weight: '600' }));
  p.push(text(48, 924, notes.map((n, i) => `${i + 1}. ${n}`).join('\n'), { size: 12, fill: '#4a4438', lh: 21 }));

  return figure(W, H, p);
};