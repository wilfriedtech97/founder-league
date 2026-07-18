import { motion } from 'framer-motion';

export default function RankingSection({ title, icon: Icon, iconColor, items, renderItem }) {
  if (!items || items.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => renderItem(item, i + 1))}
      </div>
    </motion.div>
  );
}