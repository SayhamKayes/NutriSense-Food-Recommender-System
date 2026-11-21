import React, { useEffect, useState } from 'react';

interface AnalogClockProps {
  largeMobile?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ largeMobile = false }) => {
  const [bdtTime, setBdtTime] = useState({
    hour: 0,
    minute: 0,
    second: 0,
    timeStr: '--:--:-- --',
    dateStr: 'Loading...'
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bdt = new Date(utc + (3600000 * 6));

      const h = bdt.getHours();
      const m = bdt.getMinutes();
      const s = bdt.getSeconds();

      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = (h % 12) || 12;
      const hS = h12 < 10 ? '0' + h12 : String(h12);
      const mS = m < 10 ? '0' + m : String(m);
      const sS = s < 10 ? '0' + s : String(s);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${days[bdt.getDay()]}, ${bdt.getDate()} ${months[bdt.getMonth()]} ${bdt.getFullYear()}`;

      setBdtTime({
        hour: h,
        minute: m,
        second: s,
        timeStr: `${hS}:${mS}:${sS} ${ampm}`,
        dateStr
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hand rotation angles
  const secAngle = bdtTime.second * 6;
  const minAngle = (bdtTime.minute + bdtTime.second / 60) * 6;
  const hourAngle = ((bdtTime.hour % 12) + bdtTime.minute / 60 + bdtTime.second / 3600) * 30;

  // Generate 60 ticks
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 6) * Math.PI / 180;
    const isHour = i % 5 === 0;
    const r1 = 43.8;
    const r2 = isHour ? 39.2 : 41.8;
    const x1 = 50 + r1 * Math.sin(angle);
    const y1 = 50 - r1 * Math.cos(angle);
    const x2 = 50 + r2 * Math.sin(angle);
    const y2 = 50 - r2 * Math.cos(angle);
    return {
      x1, y1, x2, y2,
      isHour,
      key: i
    };
  });

  // Numbers 1-12
  const numbers = Array.from({ length: 12 }).map((_, i) => {
    const num = i + 1;
    const angle = (num * 30) * Math.PI / 180;
    const r = 33.2;
    const x = 50 + r * Math.sin(angle);
    const y = 50 - r * Math.cos(angle) + 2.6;
    return { num, x, y };
  });

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center box-border w-full ${
        largeMobile
          ? 'p-3 justify-center sm:justify-start gap-3.5 min-h-[124px] lg:h-[116px] lg:p-2.5'
          : 'p-2.5 sm:p-3 justify-start gap-3 h-[116px]'
      }`}
    >
      {/* SVG Wall Clock (Sapling Model) */}
      <div
        className={`shrink-0 ${
          largeMobile ? 'w-[108px] h-[108px] lg:w-[96px] lg:h-[96px]' : 'w-[96px] h-[96px]'
        }`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full select-none">
          {/* Outer Bezel Rim */}
          <circle cx="50" cy="50" r="47.5" fill="#ffffff" stroke="#0f172a" strokeWidth="4.5" />
          <circle cx="50" cy="50" r="44.8" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />

          {/* Ticks */}
          {ticks.map((t) => (
            <line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isHour ? '#0f172a' : '#64748b'}
              strokeWidth={t.isHour ? 1.4 : 0.65}
              strokeLinecap="round"
            />
          ))}

          {/* Arabic Numbers 1-12 */}
          {numbers.map((n) => (
            <text
              key={n.num}
              x={n.x}
              y={n.y}
              textAnchor="middle"
              fontSize="7.4"
              fontWeight="700"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fill="#0f172a"
            >
              {n.num}
            </text>
          ))}

          {/* Sapling Logo */}
          <text
            x="50"
            y="66"
            textAnchor="middle"
            fontSize="4.2"
            fontWeight="600"
            fill="#64748b"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.04em"
          >
            sapling
          </text>

          {/* Hour Hand */}
          <line
            x1="50"
            y1="53"
            x2="50"
            y2="27"
            stroke="#0f172a"
            strokeWidth="2.6"
            strokeLinecap="round"
            transform={`rotate(${hourAngle}, 50, 50)`}
          />

          {/* Minute Hand */}
          <line
            x1="50"
            y1="54"
            x2="50"
            y2="15"
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinecap="round"
            transform={`rotate(${minAngle}, 50, 50)`}
          />

          {/* Red Second Hand with Counterbalance Tail */}
          <line
            x1="50"
            y1="62"
            x2="50"
            y2="12"
            stroke="#dc2626"
            strokeWidth="0.9"
            strokeLinecap="round"
            transform={`rotate(${secAngle}, 50, 50)`}
          />

          {/* Pivot Center Cap */}
          <circle cx="50" cy="50" r="2.2" fill="#dc2626" />
          <circle cx="50" cy="50" r="0.9" fill="#0f172a" />
        </svg>
      </div>

      {/* Clock Digital Details */}
      <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
        <div className="inline-flex items-center gap-1.5 text-[0.68rem] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-1 border border-blue-100">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
          LIVE BDT
        </div>
        <div className="text-[1.2rem] sm:text-[1.25rem] font-extrabold text-slate-900 leading-tight tabular-nums truncate">
          {bdtTime.timeStr.slice(0, 8)} <span className="text-xs font-bold text-blue-600">{bdtTime.timeStr.slice(9)}</span>
        </div>
        <div className="text-[0.72rem] font-semibold text-slate-500 mt-0.5 truncate">
          {bdtTime.dateStr}
        </div>
      </div>
    </div>
  );
};

