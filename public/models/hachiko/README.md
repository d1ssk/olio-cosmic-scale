# Hachikō model

This work is based on [“Hachikō”](https://sketchfab.com/3d-models/hachiko-fffee43c3cbc4b7ea20d6556a360b25f) by [Maurice Svay](https://sketchfab.com/mauricesvay), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The original supplied credit is retained in `LICENSE.txt`.

Imported on 2026-09-09 from the user's official Sketchfab downloads. Uses the supplied lighter JPEG variant (`hachiko (1).glb`). `scripts/prepare-hachiko.py` repacks its 32-bit indices as 16-bit integers without changing geometry, materials, texture, UVs, or transforms. The model retains 97,157 triangles and 56,273 exported vertices (including attribute seams). No runtime decoder or external asset service is needed.

- Supplied full texture GLB: 8,078,832 bytes
- Supplied lighter texture GLB: 3,540,168 bytes
- Served GLB: 2,957,240 bytes

Display modification: proportionally scaled to an adopted full height of 1.7 m, including the base, and centered with its base at Y=0. This is a display convention, **not a measured real-world dimension**. The scene displays this convention along with the author, source, and license.

The temporary original downloads are not retained in the repository. The committed served GLB is sufficient to run and build the app. To repeat preprocessing, obtain the lighter GLB from the source linked above and pass its local path:

```sh
python3 scripts/prepare-hachiko.py '/path/to/hachiko-lighter.glb'
```
