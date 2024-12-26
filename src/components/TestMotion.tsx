'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

const TestMotion = () => {
  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ backgroundColor: 'blue', padding: '1rem', color: 'white' }}
      >
        Test Motion Component
      </motion.div>
    </div>
  );
};

export default TestMotion; 