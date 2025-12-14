export function AuthLogo() {
  return (
    <div className="flex justify-center mb-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FE2C55] via-[#00F2EA] to-[#FE2C55] rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative bg-[#1e1e1e] rounded-3xl flex items-center justify-center px-8 py-3">
          <span className="text-4xl font-black bg-gradient-to-r from-[#FE2C55] via-[#FF6B9D] to-[#00F2EA] text-transparent bg-clip-text">
            Toptop
          </span>
        </div>
      </div>
    </div>
  );
}
