# AdOS Executive Presentation

The official AdOS executive presentation. Built to the specification documents in
this folder. Isolated to `presentation/`; does not touch the AdOS application.

## Deliverables

- **`AdOS_Executive_Presentation.pptx`** — editable PowerPoint, 22 slides, 16:9,
  dark theme, native vector shapes (perimeter / pipeline / comparison diagrams are
  drawn as shapes, not images), bilingual EN/TR. No external or copyrighted assets.
- **`AdOS_Executive_Presentation.pdf`** — exported PDF of the same deck.
- **`build_presentation.py`** — the generator (single source; edit here and rebuild).

## Specification

- `PRESENTATION_CONSTITUTION.md` — objectives, audience, storytelling, visual
  language, messaging (20 sections)
- `PRESENTATION_STORYBOARD.md` — ~20 slides, each fully specified
- `PRESENTATION_CONTENT.md` — final bilingual copy + speaker notes
- `PRESENTATION_VISUAL_GUIDE.md` — every illustration described

## Rebuild

```bash
cd presentation
python3 build_presentation.py     # regenerates the .pptx and .pdf
```

Dependencies: `python-pptx`, `reportlab`. The PDF uses a system Arial for correct
Turkish glyphs.

## Notes

- **Animation-ready:** every build element (diagram nodes, comparison rows,
  cards) is a discrete shape, so PowerPoint entrance animations can be added per
  object for progressive disclosure (see `PRESENTATION_CONSTITUTION.md` §7).
- **Speaker notes** are authored in `PRESENTATION_CONTENT.md` (bilingual); paste
  into the PowerPoint notes pane per slide if delivering from PowerPoint.
- The deck is designed for a **non-technical executive audience**; the demo
  (slide 17) is a placeholder frame for a live or recorded product walkthrough.
