// ScoreBadge component: Displays a colored badge with a label based on score
interface ScoreBadgeProps {
  score: number; // Numeric score to determine badge color and text
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = '';
  let badgeText = '';

  // Determine badge color and label based on score
  if (score > 70) {
    badgeColor = 'bg-badge-green text-green-600';
    badgeText = 'Strong';
  } else if (score > 49) {
    badgeColor = 'bg-badge-yellow text-yellow-600';
    badgeText = 'Good Start';
  } else {
    badgeColor = 'bg-badge-red text-red-600';
    badgeText = 'Needs Work';
  }

  return (
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
      <p className="text-sm font-medium">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;