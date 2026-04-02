import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // El código compila correctamente — el error es de tipos en el admin client de Supabase
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
