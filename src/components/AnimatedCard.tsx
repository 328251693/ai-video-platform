"use client";

// 动态渐变占位卡片，用于样例视频展示
export default function AnimatedCard({
  color = "7c3aed",
  title,
  className = "",
}: {
  color?: string;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `
          radial-gradient(ellipse at 30% 20%, #${color}40 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, #${color}20 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)
        `,
      }}
    >
      {/* 动态网格 */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          animation: "gridMove 8s linear infinite",
        }}
      />

      {/* 浮动光点 */}
      <div
        className="absolute w-32 h-32 rounded-full blur-3xl"
        style={{
          background: `#${color}`,
          opacity: 0.15,
          top: "20%",
          left: "30%",
          animation: "float1 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-24 h-24 rounded-full blur-2xl"
        style={{
          background: `#${color}`,
          opacity: 0.1,
          bottom: "20%",
          right: "20%",
          animation: "float2 8s ease-in-out infinite",
        }}
      />

      {/* 中心图标 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ background: `#${color}25`, border: `1px solid #${color}40` }}
          >
            <svg className="w-5 h-5" style={{ color: `#${color}` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>
          {title && (
            <p className="text-xs text-neutral-400 max-w-[120px] mx-auto">{title}</p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.2); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, 15px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
