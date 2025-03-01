interface BaseCamViewProps {
  url: string
}

export default function BaseCamView({ url }: BaseCamViewProps) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-2">Base Camera</h3>
      <div className="aspect-w-16 aspect-h-9">
        <img src={url} alt="Base camera view" className="object-cover rounded-lg" />
      </div>
    </div>
  )
}

