import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon } from "./icons"; // You can replace this with a custom icon

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
          {/* Replace or add your own icons */}
          <MessageIcon />
          <span className="font-bold text-lg">Poppins.bot</span>
        </p>
        <p>
          Welcome to Poppins.bot, your personalized parenting assistant. 
          Designed to offer advice, tips, and resources to help you navigate 
          the joys and challenges of parenting, all with a human touch.
        </p>
        <p>
          Powered by state-of-the-art AI technology, Poppins.bot is here to 
          provide tailored solutions for every stage of parenting, from 
          managing screen time to planning engaging activities.
        </p>
        <p>
          Learn more about our parent company and explore additional resources 
          at{" "}
          <Link
            className="text-blue-500 dark:text-blue-400 underline"
            href="https://www.lbs.ventures"
            target="_blank"
          >
            www.lbs.ventures
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
