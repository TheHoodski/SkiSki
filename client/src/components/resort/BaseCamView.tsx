
interface BaseCamViewProps {
  url: string;
}

export default function BaseCamView({ url }: BaseCamViewProps) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <img src={url} alt="Base Camera View" className="w-full h-full object-cover" />
    </div>
  );
}

