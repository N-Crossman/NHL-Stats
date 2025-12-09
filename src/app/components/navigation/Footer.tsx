export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white text-center py-4 mt-8">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} NHL Stats App. All rights reserved.
      </p>
    </footer>
  );
}