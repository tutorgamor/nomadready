import { motion } from "motion/react";

const VP = { once: true, margin: "-70px" as const };
const EASE = [0.22, 1, 0.36, 1] as const;

export function FieldNote() {
  return (
    <article className="field-note" aria-label="Field note: Bangkok">

      {/* Eyebrow row */}
      <motion.div
        className="field-note__eyebrow"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VP}
        transition={{ duration: 0.55, delay: 0 }}
      >
        <span className="field-note__label">Field Note</span>
        <span className="field-note__thin-rule" aria-hidden="true" />
        <span className="field-note__loc">Bangkok</span>
        <span className="field-note__flag" aria-hidden="true">🇹🇭</span>
      </motion.div>

      {/* Primary editorial text */}
      <motion.div
        className="field-note__body"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.85, delay: 0.14, ease: EASE }}
      >
        <p className="field-note__primary">
          Bangkok doesn't ease you in.
          The heat arrives first — dense, already present when you leave the airport.
          Then the noise. Then the movement folded over movement.
        </p>
        <p className="field-note__primary field-note__primary--gap">
          For the first few days, the city feels relentless.
        </p>
        <p className="field-note__primary">
          Then something shifts. The same streets that exhausted you become familiar.
          The chaos was never chaos — just a rhythm you hadn't yet learned to hear.
        </p>
      </motion.div>

      {/* Thin separator */}
      <motion.div
        className="field-note__sep"
        aria-hidden="true"
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VP}
        transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
      />

      {/* Secondary observation */}
      <motion.p
        className="field-note__secondary"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VP}
        transition={{ duration: 0.65, delay: 0.44 }}
      >
        Most people leave before this happens.
      </motion.p>

      {/* Thin separator */}
      <motion.div
        className="field-note__sep"
        aria-hidden="true"
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VP}
        transition={{ duration: 0.5, delay: 0.52, ease: EASE }}
      />

      {/* Footer metadata */}
      <motion.div
        className="field-note__meta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VP}
        transition={{ duration: 0.55, delay: 0.62 }}
      >
        <span>Thailand</span>
        <span aria-hidden="true">·</span>
        <span>Southeast Asia</span>
        <span aria-hidden="true">·</span>
        <span>Field Reference 001</span>
      </motion.div>

      {/* Compass watermark — editorial decoration */}
      <div className="field-note__watermark" aria-hidden="true">
        <img
          src="/assets/editorial/compass/compass.jpg"
          alt=""
          className="field-note__compass"
          loading="lazy"
          decoding="async"
        />
      </div>

    </article>
  );
}
