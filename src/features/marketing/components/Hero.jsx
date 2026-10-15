import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { HeroPipelineVisual } from "./HeroPipelineVisual";
import { Link } from "react-router";

const ease = [0.16, 1, 0.3, 1];
const MotionLink = motion.create(Link);

export function Hero() {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const inView = useInView(ref, { amount: 0.15 });
  const reveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="hero" id="home" ref={ref}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-layout">
        <motion.div
          className="hero-copy"
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.09 } },
          }}
        >
          <motion.p
            className="hero-kicker"
            variants={reveal}
            transition={{ duration: 0.48, ease }}
          >
            Autonomous sales intelligence
          </motion.p>
          <motion.h1
            className="hero-headline"
            variants={reveal}
            transition={{ duration: 0.7, ease }}
          >
            Turn every conversation into a qualified opportunity.
          </motion.h1>
          <motion.p
            className="hero-lead"
            variants={reveal}
            transition={{ duration: 0.58, ease }}
          >
            LeadHive AI understands, qualifies, and prioritizes inbound
            conversations across every channel, so your team acts on the
            opportunities that matter.
          </motion.p>
          <motion.div
            className="hero-actions"
            variants={reveal}
            transition={{ duration: 0.58, ease }}
          >
            <MotionLink
              to="/test-demo"
              className="hero-primary-cta"
              whileHover={reducedMotion ? undefined : { y: -1 }}
              whileTap={{ scale: 0.985 }}
            >
              Test Demo <ArrowRight size={16} />
            </MotionLink>
            <a href="#workflow" className="hero-secondary-cta">
              See how it works <ChevronRight size={16} />
            </a>
          </motion.div>
          <motion.div
            className="hero-metric-line"
            variants={reveal}
            transition={{ duration: 0.58, ease }}
          >
            <span className="proof-dot" /> Built for teams managing high-volume
            digital conversations.
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-visual-column"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease }}
        >
          <div className="hero-flow-frame">
            <HeroPipelineVisual active={inView && !reducedMotion} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}