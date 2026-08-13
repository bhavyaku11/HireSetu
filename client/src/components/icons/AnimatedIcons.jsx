import React from 'react';
import { motion } from 'framer-motion';

/**
 * Common prop types helper:
 * - className: Tailwind text color and size (e.g. "w-6 h-6 text-indigo-600 dark:text-indigo-400")
 * - isHovered: optional boolean for programmatic hover trigger from parent
 */

// 1. Animated Pen / Edit Icon (Build & Edit)
export function AnimatedPenIcon({ className = 'w-6 h-6', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.path
        d="M12 20h9"
        variants={{
          initial: { pathLength: 1, opacity: 0.8 },
          hover: { pathLength: [0.2, 1], opacity: 1, transition: { duration: 0.4 } },
        }}
      />
      <motion.path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        variants={{
          initial: { rotate: 0, x: 0, y: 0 },
          hover: {
            rotate: [0, -12, 8, -4, 0],
            x: [0, -1, 1, 0],
            y: [0, 1, -1, 0],
            transition: { duration: 0.5, ease: 'easeInOut' },
          },
        }}
      />
    </motion.svg>
  );
}

// 2. Animated Shield / Check Icon (Feedback, ATS Score, Shield)
export function AnimatedShieldCheckIcon({ className = 'w-6 h-6', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        variants={{
          initial: { scale: 1 },
          hover: {
            scale: [1, 1.08, 1],
            transition: { duration: 0.45, ease: 'easeOut' },
          },
        }}
      />
      <motion.path
        d="M9 12l2 2 4-4"
        variants={{
          initial: { pathLength: 1, scale: 1 },
          hover: {
            pathLength: [0, 1],
            scale: [0.8, 1.2, 1],
            transition: { duration: 0.4, delay: 0.1 },
          },
        }}
      />
    </motion.svg>
  );
}

// 3. Animated Download / Cloud Icon (Export)
export function AnimatedDownloadCloudIcon({ className = 'w-6 h-6', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.path
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        variants={{
          initial: { y: 0 },
          hover: { y: [0, -2, 0], transition: { duration: 0.4 } },
        }}
      />
      <motion.path
        d="M12 12v9"
        variants={{
          initial: { y: 0 },
          hover: { y: [0, 3, 0], transition: { duration: 0.45, ease: 'easeInOut' } },
        }}
      />
      <motion.path
        d="m8 17 4 4 4-4"
        variants={{
          initial: { y: 0 },
          hover: { y: [0, 3, 0], transition: { duration: 0.45, ease: 'easeInOut' } },
        }}
      />
    </motion.svg>
  );
}

// 4. Animated Sparkles Icon (AI Builder / Tailored)
export function AnimatedSparklesIcon({ className = 'w-6 h-6', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      {/* Central Sparkle */}
      <motion.path
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        variants={{
          initial: { rotate: 0, scale: 1 },
          hover: {
            rotate: [0, 45, 0],
            scale: [1, 1.2, 1],
            transition: { duration: 0.5, ease: 'easeInOut' },
          },
        }}
      />
      {/* Small Top Right Star */}
      <motion.path
        d="M20 3v4M22 5h-4"
        variants={{
          initial: { scale: 1, opacity: 0.8 },
          hover: {
            scale: [0.7, 1.3, 1],
            opacity: [0.5, 1, 0.8],
            transition: { duration: 0.4, delay: 0.1 },
          },
        }}
      />
    </motion.svg>
  );
}

// 5. Animated Target / Crosshair Icon (Job Match)
export function AnimatedTargetIcon({ className = 'w-6 h-6', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.1, 1], transition: { duration: 0.4 } },
        }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="6"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.2, 1], transition: { duration: 0.4, delay: 0.05 } },
        }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.4, 1], transition: { duration: 0.4, delay: 0.1 } },
        }}
      />
    </motion.svg>
  );
}

// 6. Animated Layout Grid Icon (Templates)
export function AnimatedLayoutGridIcon({ className = 'w-6 h-6', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.15, 1], transition: { duration: 0.3 } },
        }}
      />
      <motion.rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.15, 1], transition: { duration: 0.3, delay: 0.08 } },
        }}
      />
      <motion.rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.15, 1], transition: { duration: 0.3, delay: 0.16 } },
        }}
      />
      <motion.rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.15, 1], transition: { duration: 0.3, delay: 0.24 } },
        }}
      />
    </motion.svg>
  );
}

// 7. Animated Check Circle Icon (ATS Safe Practices)
export function AnimatedCheckCircleIcon({ className = 'w-5 h-5', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.1, 1], transition: { duration: 0.4 } },
        }}
      />
      <motion.path
        d="m9 12 2 2 4-4"
        variants={{
          initial: { pathLength: 1, scale: 1 },
          hover: {
            pathLength: [0.5, 1],
            scale: [0.8, 1.25, 1],
            transition: { duration: 0.35, ease: 'easeOut' },
          },
        }}
      />
    </motion.svg>
  );
}

// 8. Animated X Circle Icon (ATS Killers)
export function AnimatedXCircleIcon({ className = 'w-5 h-5', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.1, 1], transition: { duration: 0.35 } },
        }}
      />
      <motion.path
        d="m15 9-6 6M9 9l6 6"
        variants={{
          initial: { rotate: 0 },
          hover: {
            rotate: [0, -15, 15, -8, 0],
            transition: { duration: 0.45, ease: 'easeInOut' },
          },
        }}
      />
    </motion.svg>
  );
}

// 9. Animated Type / Text Icon (Fonts Rule)
export function AnimatedTypeTextIcon({ className = 'w-5 h-5', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.path
        d="M4 7V4h16v3"
        variants={{
          initial: { y: 0 },
          hover: { y: [0, -1, 0], transition: { duration: 0.3 } },
        }}
      />
      <motion.path
        d="M9 20h6"
        variants={{
          initial: { scaleX: 1 },
          hover: { scaleX: [1, 1.2, 1], transition: { duration: 0.3, delay: 0.1 } },
        }}
      />
      <motion.path
        d="M12 4v16"
        variants={{
          initial: { scaleY: 1 },
          hover: { scaleY: [1, 1.1, 1], transition: { duration: 0.35 } },
        }}
      />
    </motion.svg>
  );
}

// 10. Animated File / Document Icon (Format / Base Resumes)
export function AnimatedFileTextIcon({ className = 'w-5 h-5', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.path
        d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
        variants={{
          initial: { y: 0, rotate: 0 },
          hover: { y: [0, -2, 0], rotate: [0, -3, 0], transition: { duration: 0.4 } },
        }}
      />
      <motion.polyline
        points="14 2 14 8 20 8"
        variants={{
          initial: { rotate: 0 },
          hover: { rotate: [0, 8, 0], transition: { duration: 0.3 } },
        }}
      />
      <motion.line
        x1="16"
        y1="13"
        x2="8"
        y2="13"
        variants={{
          initial: { scaleX: 1 },
          hover: { scaleX: [0.7, 1.1, 1], transition: { duration: 0.3, delay: 0.1 } },
        }}
      />
      <motion.line
        x1="16"
        y1="17"
        x2="8"
        y2="17"
        variants={{
          initial: { scaleX: 1 },
          hover: { scaleX: [0.7, 1.1, 1], transition: { duration: 0.3, delay: 0.18 } },
        }}
      />
    </motion.svg>
  );
}

// 11. Animated Folder Icon (Total Resumes)
export function AnimatedFolderIcon({ className = 'w-5 h-5', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.path
        d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
        variants={{
          initial: { y: 0 },
          hover: { y: [0, -2, 0], transition: { duration: 0.4 } },
        }}
      />
    </motion.svg>
  );
}

// 12. Animated Clock Icon (Last Activity)
export function AnimatedClockIcon({ className = 'w-5 h-5', isHovered = false }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
      whileHover="hover"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={{
          initial: { scale: 1 },
          hover: { scale: [1, 1.06, 1], transition: { duration: 0.4 } },
        }}
      />
      <motion.polyline
        points="12 6 12 12 16 14"
        style={{ transformOrigin: '12px 12px' }}
        variants={{
          initial: { rotate: 0 },
          hover: { rotate: [0, 360], transition: { duration: 0.7, ease: 'easeInOut' } },
        }}
      />
    </motion.svg>
  );
}
