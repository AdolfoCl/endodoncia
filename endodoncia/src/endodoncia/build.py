"""
Static site generator for the Spanish clone of msendo.com/root-canal-treatment.

This script renders Jinja2 templates into a dist/ output folder. It embeds
content translated to Spanish and fills in specialist details.
"""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import Dict

from jinja2 import Environment, FileSystemLoader, select_autoescape


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = PROJECT_ROOT / "src"
PACKAGE_DIR = SRC_DIR / "endodoncia"
TEMPLATES_DIR = PACKAGE_DIR / "templates"
ASSETS_DIR = PACKAGE_DIR / "assets"
DIST_DIR = PROJECT_ROOT / "dist"


def get_site_context() -> Dict[str, str]:
    """Return the site context to inject into templates.

    All strings are Spanish translations or localized variants.
    """
    return {
        "site_phone": "+56 9 4160 3277",
        "site_phone_link": "tel:+56941603277",
        "site_address": "Av. Las Condes 10465 oficina 116, Las Condes",
        "site_title": "Tratamiento de Conductos (Endodoncia)",
        "hero_title": "Tratamiento de Conductos",
        "hero_subtitle": "Atención precisa y cómoda con tecnología de vanguardia",
        "cta_referral": "Formulario de Referencia",
        "cta_appointment": "Solicitar Cita",
        "menu_home": "Inicio",
        "menu_about": "Sobre Nosotros",
        "menu_services": "Servicios",
        "menu_contact": "Contacto",
        "services": [
            {"title": "Tratamiento de Conductos", "slug": "root-canal-treatment"},
            {"title": "Retratamiento de Conductos", "slug": "root-canal-retreatment"},
            {"title": "Microcirugía Endodóntica", "slug": "endodontic-microsurgery"},
            {"title": "Trauma Dental", "slug": "dental-trauma"},
            {"title": "Blanqueamiento Interno", "slug": "internal-bleaching"},
        ],
        # Specialist info (placeholder - update if verified)
        "specialist_name": "Andrés Morales Jalilie",
        "specialist_title": "Endodoncista",
        "specialist_bio": (
            "Endodoncista enfocado en terapias de conservación dental, con experiencia en"
            " técnicas microquirúrgicas y el uso de microscopio operatorio."
        ),
    }


def clean_dist() -> None:
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)


def copy_assets() -> None:
    if ASSETS_DIR.exists():
        shutil.copytree(ASSETS_DIR, DIST_DIR / "assets")


def render_templates() -> None:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    context = get_site_context()

    # Template to URL mapping
    templates = [
        ("index.html", "index.html"),
        ("root-canal.html", "root-canal-treatment/index.html"),
        ("root-canal-retreatment.html", "root-canal-retreatment/index.html"),
        ("endodontic-microsurgery.html", "endodontic-microsurgery/index.html"),
        ("dental-trauma.html", "dental-trauma/index.html"),
        ("internal-bleaching.html", "internal-bleaching/index.html"),
        ("contact-form.html", "contacto/index.html"),
    ]

    for template_name, output_path in templates:
        template = env.get_template(template_name)
        html = template.render(**context)
        out_path = DIST_DIR / output_path
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html, encoding="utf-8")


def build() -> None:
    clean_dist()
    copy_assets()
    render_templates()
    print(f"Build complete: {DIST_DIR}")


if __name__ == "__main__":
    build()


