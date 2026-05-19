import { useRef, useEffect, useState, useCallback } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
  useInView,
} from 'framer-motion'
import lottieWeb from 'lottie-web'
import { processSteps } from '../../data/platforms'

import discoveryCallAnim from '../../assets/lottie/discoveryCall.json'
import strategyAnim from '../../assets/lottie/strategy.json'
import onboardingAnim from '../../assets/lottie/onboarding.json'
import executionAnim from '../../assets/lottie/execution.json'
import reportAnim from '../../assets/lottie/report.json'
import scaleAnim from '../../assets/lottie/scale.json'

const lottieAnims = [
  discoveryCallAnim,
  strategyAnim,
  onboardingAnim,
  executionAnim,
  reportAnim,
  scaleAnim,
]

const TOTAL = processSteps.length
const SEG = 1 / 11
const WAVE = 38
const NODE_R = 22
const GAP = 12

function LottiePlayer({ animationData, style }) {
  const el = useRef(null)

  useEffect(() => {
    if (!el.current) return

    const anim = lottieWeb.loadAnimation({
      container: el.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    })

    return () => anim.destroy()
  }, [animationData])

  return <div ref={el} style={style} />
}

function MobileCard({ step, anim, index }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-18%' })

  return (
      <motion.div
          ref={ref}
          initial={{
            opacity: 0,
            y: 80,
            scale: 0.88,
            rotateX: 12,
            filter: 'blur(14px)',
          }}
          animate={
            visible
                ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  filter: 'blur(0px)',
                }
                : {}
          }
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
            delay: index * 0.05,
          }}
          className="relative flex flex-col pb-16 pl-12"
      >
        {/* Inactive timeline line */}
        <div className="absolute left-[20px] top-0 bottom-0 w-px bg-white/10" />

        {/* Active beam */}
        <motion.div
            className="absolute left-[20px] top-0 bottom-0 w-px rounded-full origin-top"
            style={{
              background: 'linear-gradient(180deg, #00D4FF, #7C3AED)',
              boxShadow: '0 0 14px rgba(0,212,255,0.7)',
            }}
            initial={{ scaleY: 0 }}
            animate={visible ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Node wrapper */}
        <div className="absolute left-[20px] top-2 z-10 w-10 h-10 -translate-x-1/2 flex items-center justify-center">
          <motion.div
              className="absolute inset-0 rounded-full border border-dashed border-[#00D4FF]/35"
              animate={visible ? { rotate: 360, opacity: 1 } : { opacity: 0.25 }}
              transition={{
                rotate: { duration: 9, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.4 },
              }}
          />

          <motion.div
              className="relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10"
              style={{
                background:
                    'radial-gradient(circle at 30% 30%, #00D4FF, #1570EF 55%, #7C3AED)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
              animate={
                visible
                    ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 10px rgba(0,212,255,0.35)',
                        '0 0 24px rgba(0,212,255,0.75)',
                        '0 0 10px rgba(0,212,255,0.35)',
                      ],
                    }
                    : {
                      scale: 0.9,
                      boxShadow: '0 0 8px rgba(255,255,255,0.08)',
                    }
              }
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
          >
            {step.step}
          </motion.div>
        </div>

        {/* Floating Lottie */}
        <motion.div
            animate={visible ? { y: [0, -8, 0], scale: [1, 1.03, 1] } : {}}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full overflow-visible"
        >
          <LottiePlayer
              animationData={anim}
              style={{
                width: '100%',
                height: 230,
              }}
          />
        </motion.div>

        <motion.div
            className="pt-4 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15 }}
        >
        <span className="text-xs text-[#00D4FF]/60 tracking-widest font-medium block mb-3">
          {step.duration}
        </span>

          <h3
              className="text-white font-black text-xl sm:text-2xl mb-2 leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {step.title}
          </h3>

          <p className="text-white/50 text-sm sm:text-base leading-relaxed">
            {step.description}
          </p>
        </motion.div>
      </motion.div>
  )
}

export default function ProcessSection() {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const trackRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const pathProgress = useTransform(scrollYProgress, [SEG, 10 * SEG], [0, 1], {
    clamp: true,
  })

  const [revealed, setRevealed] = useState([
    true,
    false,
    false,
    false,
    false,
    false,
  ])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = [
      true,
      v >= 2 * SEG,
      v >= 4 * SEG,
      v >= 6 * SEG,
      v >= 8 * SEG,
      v >= 10 * SEG,
    ]

    setRevealed((prev) =>
        prev.every((p, i) => p === next[i]) ? prev : next
    )
  })

  const [svgD, setSvgD] = useState('')
  const [nodes, setNodes] = useState([])
  const [svgBox, setSvgBox] = useState({ w: 0, h: 0 })
  const [pathLen, setPathLen] = useState(0)

  const dotOffset = useTransform(pathProgress, [0, 1], [6, -(pathLen + 6)])

  const calcGeom = useCallback(() => {
    if (!containerRef.current) return

    const cr = containerRef.current.getBoundingClientRect()
    if (!cr.width || !cr.height) return

    const cy = cr.height / 2
    const w = cr.width

    const nds = Array.from({ length: TOTAL }, (_, i) => ({
      x: (w * (2 * i + 1)) / (2 * TOTAL),
      y: cy,
    }))

    let d = `M ${nds[0].x.toFixed(1)},${cy.toFixed(1)}`

    for (let i = 0; i < TOTAL - 1; i++) {
      const x1 = nds[i].x
      const x2 = nds[i + 1].x
      const dx = x2 - x1
      const sign = i % 2 === 0 ? 1 : -1
      const wy = cy + sign * WAVE

      d += ` C ${(x1 + dx / 3).toFixed(1)},${wy.toFixed(1)} ${(x2 - dx / 3).toFixed(1)},${wy.toFixed(1)} ${x2.toFixed(1)},${cy.toFixed(1)}`
    }

    setSvgD(d)
    setNodes(nds)
    setSvgBox({ w: cr.width, h: cr.height })
  }, [])

  useEffect(() => {
    const id = setTimeout(calcGeom, 80)
    const ro = new ResizeObserver(calcGeom)

    if (containerRef.current) ro.observe(containerRef.current)

    return () => {
      clearTimeout(id)
      ro.disconnect()
    }
  }, [calcGeom])

  useEffect(() => {
    if (trackRef.current && svgD) {
      const length = trackRef.current.getTotalLength()
      if (length > 0) setPathLen(length)
    }
  }, [svgD])

  const showSvg = svgD && svgBox.w > 0

  return (
      <>
        <section
            ref={sectionRef}
            className="hidden lg:block relative bg-[#050508]"
            style={{ height: '500vh' }}
        >
          <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                      'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,212,255,0.055) 0%, rgba(124,58,237,0.045) 42%, transparent 68%)',
                }}
            />

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.025,
                  backgroundImage:
                      'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
                  backgroundSize: '80px 80px',
                }}
            />

            <motion.div
                className="relative z-20 flex-shrink-0 text-center pt-20 pb-4 px-8"
                initial={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                  className="text-[10px] tracking-[0.42em] uppercase text-[#00D4FF]/70 font-semibold mb-3 block"
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                How It Works
              </motion.span>

              <h2
                  className="text-3xl xl:text-5xl font-black text-white leading-tight"
                  style={{ fontFamily: 'Syne, sans-serif' }}
              >
                From Zero to{' '}
                <motion.span
                    className="gradient-text inline-block"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  7 Figures
                </motion.span>
              </h2>

              <motion.p
                  className="text-white/45 text-sm xl:text-base max-w-xl mx-auto mt-3"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
              >
                A futuristic execution system designed to launch, optimize, and scale your eCommerce growth.
              </motion.p>
            </motion.div>

            <div ref={containerRef} className="relative flex-1 w-full">
              {showSvg && (
                  <svg
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        width: svgBox.w,
                        height: svgBox.h,
                        overflow: 'visible',
                        zIndex: 2,
                      }}
                  >
                    <defs>
                      <radialGradient id="nodeGradient">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="55%" stopColor="#1570EF" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </radialGradient>

                      <filter id="beamGlow" x="-40%" y="-600%" width="180%" height="1300%">
                        <feGaussianBlur stdDeviation="4.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <filter id="orbGlow" x="-400%" y="-400%" width="900%" height="900%">
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <filter id="nodeGlow" x="-250%" y="-250%" width="600%" height="600%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    <path
                        ref={trackRef}
                        d={svgD}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="5 14"
                    />

                    <motion.path
                        d={svgD}
                        fill="none"
                        stroke="#00D4FF"
                        strokeWidth="20"
                        strokeLinecap="round"
                        style={{ pathLength: pathProgress, opacity: 0.06 }}
                    />

                    <motion.path
                        d={svgD}
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        filter="url(#beamGlow)"
                        style={{ pathLength: pathProgress, opacity: 0.95 }}
                    />

                    {pathLen > 0 && (
                        <motion.path
                            d={svgD}
                            fill="none"
                            stroke="#00D4FF"
                            strokeWidth="11"
                            strokeLinecap="round"
                            strokeDasharray={`5 ${pathLen + 9999}`}
                            filter="url(#orbGlow)"
                            style={{ strokeDashoffset: dotOffset }}
                        />
                    )}

                    {nodes.map((nd, i) => (
                        <g
                            key={`node-${i}`}
                            transform={`translate(${nd.x.toFixed(1)},${nd.y.toFixed(1)})`}
                        >
                          {/* Outer rotating ring */}
                          <motion.circle
                              r={NODE_R + 8}
                              fill="none"
                              stroke="rgba(0,212,255,0.22)"
                              strokeWidth="1"
                              strokeDasharray="12 10"
                              animate={{
                                rotate: 360,
                                opacity: revealed[i] ? 1 : 0.3,
                              }}
                              transition={{
                                rotate: {
                                  duration: 10,
                                  repeat: Infinity,
                                  ease: 'linear',
                                },
                              }}
                              style={{ transformOrigin: 'center' }}
                          />

                          {/* Main core */}
                          <motion.circle
                              r={NODE_R}
                              animate={{
                                fill: revealed[i]
                                    ? 'url(#nodeGradient)'
                                    : '#111114',
                                stroke: revealed[i]
                                    ? '#00D4FF'
                                    : 'rgba(255,255,255,0.12)',
                                strokeWidth: revealed[i] ? 2 : 1,
                                scale: revealed[i] ? [1, 1.04, 1] : 1,
                              }}
                              transition={{
                                scale: {
                                  duration: 2.4,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                },
                              }}
                              style={{
                                filter: revealed[i]
                                    ? 'drop-shadow(0 0 14px rgba(0,212,255,0.45))'
                                    : 'none',
                              }}
                          />

                          {/* Step number */}
                          <motion.text
                              textAnchor="middle"
                              dominantBaseline="central"
                              y="0.5"
                              fontSize="10"
                              fontWeight="900"
                              fontFamily="Syne, sans-serif"
                              animate={{
                                fill: revealed[i]
                                    ? '#ffffff'
                                    : 'rgba(255,255,255,0.3)',
                              }}
                          >
                            {processSteps[i].step}
                          </motion.text>
                        </g>
                    ))}

                    {nodes.slice(0, -1).map((nd, i) => {
                      const nx = nodes[i + 1].x
                      const mx = (nd.x + nx) / 2
                      const my = nd.y + (i % 2 === 0 ? 1 : -1) * WAVE * 0.75

                      return (
                          <motion.path
                              key={`arr-${i}`}
                              d={`M ${mx - 9},${my - 6} L ${mx + 8},${my} L ${mx - 9},${my + 6}`}
                              fill="none"
                              stroke="#00D4FF"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              animate={{
                                opacity: revealed[i + 1] ? 1 : 0,
                                x: revealed[i + 1] ? [0, 5, 0] : 0,
                                filter: revealed[i + 1]
                                    ? 'drop-shadow(0 0 8px rgba(0,212,255,1))'
                                    : 'none',
                              }}
                              transition={{
                                opacity: { duration: 0.45 },
                                x: {
                                  duration: 1.2,
                                  repeat: revealed[i + 1] ? Infinity : 0,
                                  ease: 'easeInOut',
                                },
                              }}
                          />
                      )
                    })}
                  </svg>
              )}

              {processSteps.map((step, i) => {
                const isTop = i % 2 === 0
                const cardW = 'clamp(175px, 14.5vw, 240px)'
                const edgePadding = 135
                const nodeX = nodes[i]?.x || 0

                const cardX = Math.min(
                    Math.max(nodeX, edgePadding),
                    svgBox.w - edgePadding
                )
                const offset = `calc(50% + ${NODE_R + GAP}px)`

                return (
                    <motion.div
                        key={step.step}
                        animate={{
                          opacity: revealed[i] ? 1 : 0,
                          scale: revealed[i] ? 1 : 0.72,
                          filter: revealed[i] ? 'blur(0px)' : 'blur(14px)',
                          y: revealed[i] ? 0 : isTop ? -45 : 45,
                          rotateX: revealed[i] ? 0 : isTop ? 12 : -12,
                        }}
                        transition={{
                          duration: 0.85,
                          ease: [0.16, 1, 0.3, 1],
                          delay: revealed[i] ? 0.08 : 0,
                        }}
                        style={{
                          position: 'absolute',
                          left: cardX,
                          x: '-50%',
                          width: cardW,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 10,
                          transformStyle: 'preserve-3d',
                          ...(isTop ? { bottom: offset } : { top: offset }),
                        }}
                    >
                      {isTop && (
                          <>
                            <motion.div
                                animate={
                                  revealed[i]
                                      ? { y: [0, -8, 0], scale: 1 }
                                      : { y: 0, scale: 0.85 }
                                }
                                transition={{
                                  y: {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  },
                                  scale: { duration: 0.6 },
                                }}
                                className="w-full"
                            >
                              <LottiePlayer
                                  animationData={lottieAnims[i]}
                                  style={{ width: '120%', height: 260 }}
                              />
                            </motion.div>

                            <div className="text-center mt-2 px-1 w-full">
                              <h3
                                  className="text-white font-bold text-md xl:text-[22px] leading-snug mb-1"
                                  style={{ fontFamily: 'Syne, sans-serif' }}
                              >
                                {step.title}
                              </h3>

                              <p className="text-white/40 text-[11px] xl:text-xs leading-relaxed mb-1">
                                {step.description}
                              </p>

                              <span className="text-[10px] text-[#00D4FF]/60 tracking-widest font-medium">
                          {step.duration}
                        </span>
                            </div>
                          </>
                      )}

                      {!isTop && (
                          <div className={'mt-2'}>
                            <div className="text-center mb-2  px-1 w-full">
                              <h3
                                  className="text-white font-bold text-md xl:text-[22px] leading-snug mb-1"
                                  style={{ fontFamily: 'Syne, sans-serif' }}
                              >
                                {step.title}
                              </h3>

                              <p className="text-white/40 text-[11px] xl:text-xs leading-relaxed mb-1">
                                {step.description}
                              </p>

                              <span className="text-[10px] text-[#00D4FF]/60 tracking-widest font-medium">
                          {step.duration}
                        </span>
                            </div>

                            <motion.div
                                animate={
                                  revealed[i]
                                      ? { y: [0, 8, 0], scale: 1 }
                                      : { y: 0, scale: 0.85 }
                                }
                                transition={{
                                  y: {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  },
                                  scale: { duration: 0.6 },
                                }}
                                className="w-full"
                            >
                              <LottiePlayer
                                  animationData={lottieAnims[i]}
                                  style={{ width: '100%', height: 190 }}
                              />
                            </motion.div>
                          </div>
                      )}
                    </motion.div>
                )
              })}
            </div>

            <div className="relative z-10 flex-shrink-0 px-10 xl:px-16 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #00D4FF, #7C3AED)',
                        boxShadow: '0 0 12px rgba(0,212,255,0.6)',
                      }}
                      animate={{
                        width: `${(revealed.filter(Boolean).length / TOTAL) * 100}%`,
                      }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </div>

                <span className="text-[11px] text-white/22 font-mono tracking-widest">
                {String(revealed.filter(Boolean).length).padStart(2, '0')} /{' '}
                  {String(TOTAL).padStart(2, '0')}
              </span>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:hidden bg-[#050508] pt-14 sm:pt-20 pb-4 relative overflow-hidden">
          <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
              style={{
                background:
                    'radial-gradient(ellipse at center, rgba(0,212,255,0.06) 0%, rgba(124,58,237,0.04) 50%, transparent 70%)',
                filter: 'blur(40px)',
              }}
          />

          <motion.div
              className="relative text-center mb-10 sm:mb-14 px-4 sm:px-6"
              initial={{ opacity: 0, y: 35, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
                className="text-xs tracking-[0.35em] uppercase text-[#00D4FF] font-semibold mb-3 block"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              How It Works
            </motion.span>

            <h2
                className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}
            >
              From Zero to{' '}
              <motion.span
                  className="gradient-text inline-block"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                7 Figures
              </motion.span>
            </h2>

            <motion.p
                className="text-white/45 text-sm sm:text-base max-w-sm mx-auto"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
              Our battle-tested process gets you results in 30 days or less.
            </motion.p>
          </motion.div>

          <div className="relative px-4 sm:px-6 max-w-lg mx-auto">
            {processSteps.map((step, i) => (
                <MobileCard
                    key={step.step}
                    step={step}
                    anim={lottieAnims[i]}
                    index={i}
                />
            ))}
          </div>
        </section>
      </>
  )
}