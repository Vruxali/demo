function MilestoneCard({ title, date, color }) {
  return (
    <div className={`${color} px-4 py-2 rounded-lg text-sm font-medium`}>
      {title} — {date}
    </div>
  );
}

export default MilestoneCard;
