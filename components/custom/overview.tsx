import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <MessageIcon />
          <span>Poppins.Bot</span>
        </p>
        <p>
          Welcome to <strong>Poppins.Bot</strong>, your personalized parenting
          assistant. Whether you're navigating tantrums, bedtime routines, or
          screen time debates, Poppins.Bot is here to help with evidence-based
          advice and creative solutions tailored to your family's needs.
        </p>
        <p>
          {" "}
          Learn more about how Poppins.Bot works by visiting{" "}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="https://www.lbs.ventures"
            target="_blank"
          >
            LBS Ventures
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
