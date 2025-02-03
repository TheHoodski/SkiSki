interface CrowdingBadgeProps {
  level: string
}

export default function CrowdingBadge({ level }: CrowdingBadgeProps) {
  const getColor = () => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-snow-white text-sm font-semibold ${getColor()}`}>
      {level}
    </span>
  )
}

