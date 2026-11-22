// 正反两面示意图：尺寸取自手绘测量图（20 px = 1 mm），沿长边自插头端起算
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
  p.push(text(48, 74, '板长 45.5 mm、板宽 13 mm、板厚 2.0 mm；比例为 1:1，即 20 px = 1 mm', { size: 13, fill: '#555' }));
  p.push(text(48, 96, '尺寸取自手绘测量图；器件位置为示意，不作装配依据', { size: 12, fill: '#8a5a24' }));

  // ---------------------------------------------------------------- 正面
  p.push(text(48, 126, '正面：USB 触点、ISP 焊盘、穿线孔、两列排针焊盘、触摸电极', { size: 15, weight: '600' }));
  p.push(rect(X0, FY, BW, BH, { fill: '#f4f1e6', stroke: '#5a5346', sw: 1.8, rx: 8 }));

  // USB 触点：4 根，长 12 mm，间距 2 mm，外侧两根加宽
  const bars = [[182, 26], [232, 18], [282, 18], [332, 26]];
  bars.forEach(([y, h]) => {
    p.push(rect(mx(0.5), y, 240, h, { fill: '#d9b45a', stroke: '#8a6d24', rx: 3 }));
  });
  p.push(text(mx(0.5), FY - 10, 'USB-A 触点 ×4：长 12 mm，间距 2 mm，外侧两根加宽', { size: 11.5, fill: '#8a6d24' }));

  // ISP 焊盘
  p.push(`<circle cx="${mx(17)}" cy="${FY + 226}" r="5" fill="#cfd8e6" stroke="#3a6ba8"/>`);
  p.push(`<circle cx="${mx(18.5)}" cy="${FY + 226}" r="5" fill="#cfd8e6" stroke="#3a6ba8"/>`);
  p.push(text(mx(17.75), FY + 210, 'ISP', { size: 10.5, anchor: 'middle', fill: '#3a6ba8' }));

  // 穿线孔
  p.push(rect(mx(21), FY + 60, 34, 140, { fill: '#ffffff', stroke: '#5a5346', sw: 1.4, rx: 3 }));
  p.push(line(mx(9.6), FY + 232, mx(20.6), FY + 150, { stroke: '#8a8378', sw: 1 }));
  p.push(text(mx(9.4), FY + 238, '穿线孔 1.7 × 7', { size: 10.5, anchor: 'end', fill: '#5a5346' }));

  // 排针焊盘：每列 6 个，间距 2.5 mm，首脚方焊盘
  for (let i = 0; i < 6; i += 1) {
    const cx = mx(24 + i * 2.5);
    [FY + 22, FY + 218].forEach((cy) => {
      if (i === 0) {
        p.push(rect(cx - 10, cy - 10, 20, 20, { fill: '#cfd8e6', stroke: '#3a6ba8', rx: 1 }));
      } else {
        p.push(`<circle cx="${cx}" cy="${cy}" r="9" fill="#cfd8e6" stroke="#3a6ba8"/>`);
      }
    });
  }



  // 屏的占位（虚线）
  p.push(rect(mx(13.5), FY + 16, 424, 218, { fill: 'none', stroke: '#3a6ba8', dash: '8 5', sw: 1.6 }));
  p.push(text(mx(27.6), FY + 110, '屏 160 × 80', { size: 14, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(text(mx(27.6), FY + 134, '可视区约 21.7 × 10.9 mm', { size: 11.5, anchor: 'middle', fill: '#3a6ba8' }));
  p.push(text(mx(27.6), FY + 156, '模组覆盖穿线孔、排针焊盘与主控', { size: 11.5, anchor: 'middle', fill: '#3a6ba8' }));

  // 触摸电极：6 × 13 mm，距板端 1 mm
  p.push(rect(mx(38.5), FY, 120, BH, { fill: '#f6dfc8', stroke: '#b07b3c', sw: 1.2, rx: 4 }));
  p.push(text(mx(42.5), FY + 34, '触摸电极', { size: 12, anchor: 'middle', fill: '#8a5a24' }));
  p.push(text(mx(42.5), FY + 54, '6 × 13', { size: 11, anchor: 'middle', fill: '#8a5a24' }));
  p.push(text(mx(42.5), FY + 72, '网格铜箔', { size: 10.5, anchor: 'middle', fill: '#8a5a24' }));
  p.push(text(mx(37.8), FY + 26, 'JP2', { size: 11, fill: '#3a6ba8' }));
  p.push(text(mx(37.8), FY + 222, 'JP3', { size: 11, fill: '#3a6ba8' }));
  p.push(`<circle cx="${mx(41.5)}" cy="${FY + 130}" r="16" fill="#f4f1e6" stroke="#5a5346" stroke-width="1.4"/>`);

  // 正面尺寸
  p.push(line(X0, FY + BH + 30, X0 + BW, FY + BH + 30, { stroke: '#888' }));
  p.push(line(X0, FY + BH + 22, X0, FY + BH + 38, { stroke: '#888' }));
  p.push(line(X0 + BW, FY + BH + 22, X0 + BW, FY + BH + 38, { stroke: '#888' }));
  p.push(text(X0 + BW / 2, FY + BH + 52, '45.5 mm', { size: 12, anchor: 'middle', fill: '#666' }));

  // ---------------------------------------------------------------- 背面
  p.push(text(48, 532, '背面（贴装面，厂商渲染图即此面）：屏座、主控、flash、电源', { size: 15, weight: '600' }));
  p.push(rect(X0, BY, BW, BH, { fill: '#f4f1e6', stroke: '#5a5346', sw: 1.8, rx: 8 }));

  // 穿线孔（背面同位置）
  p.push(rect(mx(21), BY + 60, 34, 140, { fill: '#ffffff', stroke: '#5a5346', sw: 1.4, rx: 3 }));

  // J1 屏座（紧贴穿线孔靠插头一侧）
  p.push(rect(mx(15), BY + 70, 110, 120, { fill: '#cfd8e6', stroke: '#3a6ba8', rx: 2 }));
  for (let i = 0; i < 8; i += 1) {
    p.push(line(mx(15) + 16 + i * 9, BY + 70, mx(15) + 16 + i * 9, BY + 82, { stroke: '#3a6ba8', sw: 1.2 }));
  }
  p.push(text(mx(15) + 55, BY + 56, 'J1 屏座 8P', { size: 11, anchor: 'middle', fill: '#3a6ba8' }));

  // U2 flash
  p.push(rect(mx(24.5), BY + 90, 100, 80, { fill: '#3a3a3a', stroke: '#111', rx: 2 }));
  p.push(text(mx(27), BY + 126, 'U2', { size: 12, anchor: 'middle', fill: '#f0f0f0' }));
  p.push(text(mx(27), BY + 148, 'P25D80H', { size: 10, anchor: 'middle', fill: '#d8d8d8' }));

  // U1 主控
  p.push(rect(mx(30.5), BY + 99, 62, 62, { fill: '#2b2b2b', stroke: '#111', rx: 3 }));
  p.push(text(mx(32.05), BY + 134, 'U1', { size: 12, anchor: 'middle', fill: '#f0f0f0' }));

  // C1 / C2 / R1
  p.push(rect(mx(13), BY + 96, 14, 34, { fill: '#c8a24a', stroke: '#8a6d24', rx: 2 }));
  p.push(text(mx(13.7), BY + 148, 'C1', { size: 10, anchor: 'middle' }));
  p.push(rect(mx(13), BY + 176, 14, 34, { fill: '#c8a24a', stroke: '#8a6d24', rx: 2 }));
  p.push(text(mx(13.7), BY + 228, 'C2', { size: 10, anchor: 'middle' }));
  p.push(rect(mx(10.2), BY + 226, 34, 14, { fill: '#3a3a3a', stroke: '#111', rx: 2 }));
  p.push(text(mx(10.9), BY + 220, 'R1', { size: 10, anchor: 'middle' }));

  // JP1（I2C）
  [39.2, 40.6, 42.0, 43.4].forEach((mm) => {
    p.push(rect(mx(mm) - 8, BY + 26, 16, 16, { fill: '#cfd8e6', stroke: '#3a6ba8', rx: 2 }));
  });
  p.push(text(mx(41.3), BY + 20, 'JP1', { size: 11, anchor: 'middle', fill: '#3a6ba8' }));

  // 触摸端圆孔
  p.push(`<circle cx="${mx(41.5)}" cy="${BY + 130}" r="16" fill="#f4f1e6" stroke="#5a5346" stroke-width="1.4"/>`);

  // FPC 路径
  p.push(line(mx(21.85), BY + 130, mx(20), BY + 130, { stroke: '#c0398a', sw: 2.4, dash: '7 4' }));
  p.push(text(mx(22.4), BY + BH + 26, 'FPC：正面 → 穿线孔 → J1', { size: 10.5, fill: '#c0398a' }));

  // 说明
  const notes = [
    '板厚 2.0 mm，USB-A 插头由 PCB 板边直接成型，无需垫片与连接器。',
    'USB 触点长 12 mm、间距 2 mm；触点区到穿线孔 9 mm，因此穿线孔起于插头端 21 mm 处。',
    '屏的 FPC 从正面穿过线孔，折到背面插入 J1；J1 紧贴穿线孔靠插头一侧。',
    '排针焊盘每列 6 个、间距 2.5 mm，首脚为方焊盘；圆心距长边 1.1 mm。2.5 mm 间距与通用 2.54 mm 排针不兼容。',
    '触摸电极为 6 × 13 mm 的阻焊层下网格铜箔，距板端 1 mm，表面无开窗、无凸起。',
    'ISP 焊盘直径 0.5 mm、圆心间距 1.5 mm，网络为 USB_D+ 与 3.3 V。',
  ];
  p.push(text(48, 900, '说明', { size: 13, weight: '600' }));
  p.push(text(48, 924, notes.map((n, i) => `${i + 1}. ${n}`).join('\n'), { size: 12, fill: '#4a4438', lh: 21 }));

  return figure(W, H, p);
};