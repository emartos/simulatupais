.DEFAULT_GOAL := help
.PHONY: help install build serve run test regression browser check check-data

help:
	@printf '%s\n' \
	  'Simula tu país · objetivos disponibles' \
	  '  make install      Instala dependencias de desarrollo desde package-lock.json' \
	  '  make build        Compila TypeScript y actualiza dist/' \
	  '  make serve        Compila y sirve la aplicación en http://127.0.0.1:5173' \
	  '  make run          Alias de make serve' \
	  '  make test         Compila y ejecuta las pruebas unitarias y del worker' \
	  '  make regression   Compila y compara las recetas fijadas del PLAYBOOK' \
	  '  make browser      Compila y ejecuta la prueba de navegador Chromium' \
	  '  make check        Ejecuta test, regression y browser' \
	  '  make check-data   Comprueba el catálogo de datos incluido'

install:
	npm ci

build:
	npm run build

serve: build
	npm start

run: serve

test: build
	node --test tests/*.test.mjs

regression: build
	npm run test:regression

browser: build
	npm run test:browser

check: test regression browser

check-data:
	npm run check:data
