import { Mail, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function JoinBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white px-4 py-3"
        >
          <div className="container max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl shrink-0">🌍</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base leading-tight">
                  Want to join World Mosaic?
                </p>
                <p className="text-xs md:text-sm text-white/85 truncate">
                  Send us an email and we'll add you to our community!
                </p>
              </div>
            </div>
            <a
              href="mailto:Prabeshmalla2222@gmail.com"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-white/90 transition-colors shadow"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">
                Prabeshmalla2222@gmail.com
              </span>
              <span className="sm:hidden">Contact Us</span>
            </a>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Dismiss"
              className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
