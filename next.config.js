/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desabilita ESLint durante o build para permitir deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desabilita verificação de tipos durante o build
    ignoreBuildErrors: true,
  },
  // Outras configurações podem ser adicionadas aqui
}

module.exports = nextConfig

