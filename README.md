# Endodoncia (sitio estático en español)

Proyecto para clonar en español la página `https://msendo.com/root-canal-treatment/` y alojarla en AWS de forma serverless (S3 + CloudFront).

## Requisitos
- uv
- Python 3.9+
- AWS CLI configurado (credenciales con permisos para S3/CloudFront)

## Instalación
```bash
cd endodoncia
uv sync
```

## Generar el sitio estático
```bash
cd endodoncia
uv run build-site
open dist/index.html
```

## Despliegue (S3 + CloudFront)
1) Crear un bucket S3 con hosting estático habilitado.
2) (Opcional) Crear distribución CloudFront apuntando al bucket.
3) Exportar variables y desplegar:
```bash
export AWS_S3_BUCKET=tu-bucket
# opcional
export AWS_S3_PREFIX=""           # ej: "site/"
export CLOUDFRONT_DIST_ID="xxxx"  # si usas CloudFront

cd endodoncia
uv run deploy-site
```

## Estructura
- `src/endodoncia/templates/`: plantillas Jinja2
- `src/endodoncia/assets/`: estilos y assets
- `src/endodoncia/build.py`: generador estático
- `src/endodoncia/deploy.py`: despliegue a AWS

## Nota legal
El contenido es una traducción inspirada en el sitio de referencia. No se copian marcas ni elementos protegidos. Ajusta textos e imágenes según tus derechos de uso.