// shared/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-mountain-blue text-snow-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          SkiCrowd &copy; {new Date().getFullYear()} | Real-time crowding data for ski resorts
        </p>
      </div>
    </footer>
  );
}