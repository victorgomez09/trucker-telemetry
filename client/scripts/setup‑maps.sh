#!/usr/bin/env bash
set -e

echo "🌍 Clonando repositorio de mapas..."
if [ ! -d "maps" ]; then
  git clone --recurse-submodules https://github.com/victorgomez09/ets2-maps.git maps
else
  echo "📁 maps ya existe — actualizando..."
  cd maps
  git pull
  git submodule update --init --recursive
  cd ..
fi

echo "🚧 Compilando parser y generator..."

cd maps

# Dependiendo de cómo estén estructurados los CLIs en ese repo:
if [ -f "package.json" ]; then
  # Usa npm para instalar dependencias y generar
  npm install
  npm run build
else
  echo "❗ No se encontró package.json en maps — revisa la estructura"
fi

cd ..

echo "✅ Repositorio maps listo en ./maps"
